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
builder.Host.ConfigureAppConfiguration((hostingContext, configBuilder) =>
{
    configBuilder.Sources.Clear();
    configBuilder.AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                 .AddJsonFile($"appsettings.{hostingContext.HostingEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: false)
                 .AddEnvironmentVariables();
});

builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .ReadFrom.Configuration(ctx.Configuration));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(connectionString) && !connectionString.Contains("<REMOTE_HOST>"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("AssignmentSystemDb"));
}

// MongoDB Atlas Configuration & Services
var mongoConnStr = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? builder.Configuration["MongoDBSettings:ConnectionString"];
var mongoDbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME")
    ?? builder.Configuration["MongoDBSettings:DatabaseName"]
    ?? "assignment_management";

if (string.IsNullOrWhiteSpace(mongoConnStr) || mongoConnStr.Contains("<db_password>"))
{
    mongoConnStr = "mongodb+srv://ekantabanik_db_user:Qh2k8Zh4WkEcwPLP@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0";
}

builder.Services.Configure<MongoDBSettings>(options =>
{
    options.ConnectionString = mongoConnStr;
    options.DatabaseName = mongoDbName;
});

builder.Services.AddSingleton<IMongoClient>(sp => new MongoClient(mongoConnStr));

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
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
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

app.UseRouting();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assignment System API v1");
    c.RoutePrefix = "swagger";
});

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    if (dbContext.Database.IsRelational())
    {
        try
        {
            await dbContext.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Relational DB migration skipped.");
        }
    }

    await DbSeeder.SeedAsync(dbContext, passwordHasher);

    try
    {
        var mongoDbContext = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
        await MongoDbSeeder.SeedAsync(mongoDbContext, passwordHasher, dbContext);
        logger.LogInformation("Successfully connected, initialized indexes, and synced data to MongoDB database '{DatabaseName}'.", mongoDbName);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to connect or initialize MongoDB Atlas database.");
    }
}

app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
