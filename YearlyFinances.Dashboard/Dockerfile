FROM ://microsoft.com AS build-env
WORKDIR /app

COPY *.sln ./
COPY YearlyFinances.Core/*.csproj ./YearlyFinances.Core/
COPY YearlyFinances.Dashboard/*.csproj ./YearlyFinances.Dashboard/
RUN dotnet restore

COPY YearlyFinances.Core/. ./YearlyFinances.Core/
COPY YearlyFinances.Dashboard/. ./YearlyFinances.Dashboard/
WORKDIR /app/YearlyFinances.Dashboard
RUN dotnet publish -c Release -o out

FROM ://microsoft.com
WORKDIR /app
COPY --from=build-env /app/YearlyFinances.Dashboard/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "YearlyFinances.Dashboard.dll"]
