using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Security;

namespace BusinessObjects.SendMail
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Laundry System", _configuration["EmailSettings:SmtpUser"]));
            email.To.Add(new MailboxAddress("", toEmail));
            email.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            email.Body = bodyBuilder.ToMessageBody();

            try
            {
                using var smtp = new SmtpClient();
                // Now using SecureSocketOptions.StartTls for STARTTLS on port 587  
                await smtp.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EmailSettings:SmtpUser"], _configuration["EmailSettings:SmtpPass"]);

                await smtp.SendAsync(email);
                _logger.LogInformation($"Email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while sending email to {toEmail}: {ex.Message}");
                throw; // Optionally rethrow the exception after logging it  
            }
            // Using 'using' will handle the disconnect automatically  
        }
    }

}
