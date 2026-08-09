# Multi-stage Dockerfile for .NET 8 Web API deployment on Render
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Disable telemetry and limit MSBuild memory footprint for free tier instances
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
ENV MSBuildEnableWorkloadResolver=false

# Copy solution and project files for caching restore layer
COPY backend/AssignmentSystem.sln ./backend/
COPY backend/AssignmentSystem.Domain/AssignmentSystem.Domain.csproj ./backend/AssignmentSystem.Domain/
COPY backend/AssignmentSystem.Application/AssignmentSystem.Application.csproj ./backend/AssignmentSystem.Application/
COPY backend/AssignmentSystem.Infrastructure/AssignmentSystem.Infrastructure.csproj ./backend/AssignmentSystem.Infrastructure/
COPY backend/AssignmentSystem.Api/AssignmentSystem.Api.csproj ./backend/AssignmentSystem.Api/
COPY backend/AssignmentSystem.UnitTests/AssignmentSystem.UnitTests.csproj ./backend/AssignmentSystem.UnitTests/

# Restore NuGet dependencies with single thread to save memory
RUN dotnet restore backend/AssignmentSystem.sln --disable-parallel

# Copy all source files and publish with low memory flags
COPY backend/ ./backend/
RUN dotnet publish backend/AssignmentSystem.Api/AssignmentSystem.Api.csproj -c Release -o /app/publish -p:UseAppHost=false -p:BuildInParallel=false -p:MaxCpuCount=1

# Runtime image stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment settings to prevent inotify file watcher limit crash in Linux containers
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Set default ASPNETCORE_URLS to bind to 8080 (Render detects HTTP traffic automatically)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AssignmentSystem.Api.dll"]
