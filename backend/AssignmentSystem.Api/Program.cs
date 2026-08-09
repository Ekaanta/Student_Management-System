using System.Text;
using AssignmentSystem.Api.Middleware;
using AssignmentSystem.Application.Configuration;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Application.Services;
using AssignmentSystem.Application.Validators;
using AssignmentSystem.Infrastructure.Data;
using AssignmentSystem.Infrastructure.Identity;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .ReadFrom.Configuration(ctx.Configuration));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// MongoDB Atlas Configuration & Services
var mongoConnStr = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? builder.Configuration["MongoDBSettings:ConnectionString"];
var mongoDbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME")
    ?? builder.Configuration["MongoDBSettings:DatabaseName"]
    ?? "assignment_management";

builder.Services.Configure<MongoDBSettings>(options =>
{
    options.ConnectionString = mongoConnStr ?? string.Empty;
    options.DatabaseName = mongoDbName;
});

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var conn = mongoConnStr ?? string.Empty;
    if (string.IsNullOrWhiteSpace(conn) || conn.Contains("<db_password>"))
    {
        return new MongoClient("mongodb://localhost:27017");
    }
    return new MongoClient(conn);
});

builder.Services.AddScoped<IMongoDbContext, MongoDbContext>();

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
builder.Services.AddScoped<IPasswordHasher, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IStudentService, StudentService>();

builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForAssignmentManagementSystem2026!WithLengthAtLeast256Bits";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "AssignmentSystemApi";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "AssignmentSystemUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Role-Based Assignment System API",
        Version = "v1",
        Description = "ASP.NET Core Web API for managing assignments, submissions, classes, and roles."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token format: Bearer {your token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assignment System API v1");
    });

    using (var scope = app.Services.CreateScope())
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        if (!string.IsNullOrWhiteSpace(connStr) && !connStr.Contains("<REMOTE_HOST>") && !connStr.Contains("localhost") && !connStr.Contains("127.0.0.1"))
        {
            try
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await dbContext.Database.MigrateAsync();
                await DbSeeder.SeedAsync(dbContext, passwordHasher);
                logger.LogInformation("Successfully connected, migrated, and seeded hosted PostgreSQL database.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to connect to hosted PostgreSQL database.");
            }
        }

        if (!string.IsNullOrWhiteSpace(mongoConnStr) && !mongoConnStr.Contains("<db_password>"))
        {
            try
            {
                var mongoDbContext = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
                var dbContext = scope.ServiceProvider.GetService<ApplicationDbContext>();
                await MongoDbSeeder.SeedAsync(mongoDbContext, passwordHasher, dbContext);
                logger.LogInformation("Successfully connected, initialized indexes, and synced data to MongoDB database '{DatabaseName}'.", mongoDbName);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to connect or initialize MongoDB Atlas database.");
            }
        }
    }
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
