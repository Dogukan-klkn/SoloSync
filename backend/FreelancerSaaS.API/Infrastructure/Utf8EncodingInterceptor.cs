using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace FreelancerSaaS.API.Infrastructure
{
    public class Utf8EncodingInterceptor : DbConnectionInterceptor
    {
        public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "SET client_encoding TO 'UTF8';";
            cmd.ExecuteNonQuery();
        }

        public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = "SET client_encoding TO 'UTF8';";
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
    }
}
