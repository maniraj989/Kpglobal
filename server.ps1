# Simple PowerShell HTTP Server
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Server started on http://localhost:$port/"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath

        # API Route: Handle Contact Form Submissions
        if ($request.HttpMethod -eq "POST" -and $url -eq "/api/contact") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            
            try {
                $data = ConvertFrom-Json $body
                
                # 1. Save submission locally to database file
                $dbPath = [System.IO.Path]::Combine((Get-Location).Path, "contact_submissions.json")
                $submissions = @()
                if (Test-Path $dbPath) {
                    $submissions = Get-Content $dbPath -Raw | ConvertFrom-Json
                    if ($submissions -isnot [array]) {
                        $submissions = @($submissions)
                    }
                }
                
                $newSubmission = [PSCustomObject]@{
                    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
                    name = $data.name
                    email = $data.email
                    telegram = $data.telegram
                    subject = $data.subject
                    message = $data.message
                }
                
                $submissions += $newSubmission
                $submissions | ConvertTo-Json -Depth 5 | Out-File -FilePath $dbPath -Encoding utf8
                Write-Host "[Contact API] Saved new submission from $($data.name) to $dbPath"
                
                # 2. Attempt to Send Email via SMTP if configuration is available
                $smtpServer = [System.Environment]::GetEnvironmentVariable("SMTP_SERVER")
                $smtpPortStr = [System.Environment]::GetEnvironmentVariable("SMTP_PORT")
                $smtpUser = [System.Environment]::GetEnvironmentVariable("SMTP_USER")
                $smtpPass = [System.Environment]::GetEnvironmentVariable("SMTP_PASS")
                $smtpTo = [System.Environment]::GetEnvironmentVariable("SMTP_TO")
                if ([string]::IsNullOrEmpty($smtpTo)) {
                    $smtpTo = "kpglobal574@gmail.com"
                }
                
                $emailSent = $false
                $emailError = ""
                
                if (-not [string]::IsNullOrEmpty($smtpServer) -and -not [string]::IsNullOrEmpty($smtpUser) -and -not [string]::IsNullOrEmpty($smtpPass)) {
                    $smtpPort = 587
                    if (-not [string]::IsNullOrEmpty($smtpPortStr)) {
                        $smtpPort = [int]$smtpPortStr
                    }
                    
                    try {
                        # Create mail message
                        $mail = New-Object System.Net.Mail.MailMessage
                        $mail.From = New-Object System.Net.Mail.MailAddress $smtpUser
                        $mail.To.Add($smtpTo)
                        $mail.Subject = "[KPGLOBAL574 Contact] $($data.name) - $($data.subject)"
                        $mail.IsBodyHtml = $true
                        
                        $emailBody = @"
<html>
<body style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #ffffff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid #ffbe1a; border-radius: 8px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <h2 style="color: #ffbe1a; border-bottom: 1px solid rgba(255,190,26,0.2); padding-bottom: 15px; margin-top: 0;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #8a8a98; width: 150px;">Full Name:</td>
                <td style="padding: 10px 0; color: #ffffff;">$($data.name)</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #8a8a98;">Email:</td>
                <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:$($data.email)" style="color: #ffbe1a; text-decoration: none;">$($data.email)</a></td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #8a8a98;">Telegram:</td>
                <td style="padding: 10px 0; color: #ffffff;">$(if ($data.telegram) { "@" + $data.telegram } else { "Not Provided" })</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #8a8a98;">Inquiry Type:</td>
                <td style="padding: 10px 0; color: #ffffff; text-transform: uppercase;">$($data.subject)</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #8a8a98; vertical-align: top;">Message:</td>
                <td style="padding: 10px 0; color: #ffffff; line-height: 1.5; white-space: pre-wrap;">$($data.message)</td>
            </tr>
        </table>
        <div style="margin-top: 30px; border-top: 1px solid rgba(255,190,26,0.2); padding-top: 15px; font-size: 0.85rem; color: #8a8a98; text-align: center;">
            Sent from KPGLOBAL574 Platform Website
        </div>
    </div>
</body>
</html>
"@
                        $mail.Body = $emailBody
                        
                        # Configure SMTP Client
                        $smtp = New-Object System.Net.Mail.SmtpClient($smtpServer, $smtpPort)
                        $smtp.EnableSsl = $true
                        $smtp.Credentials = New-Object System.Net.NetworkCredential($smtpUser, $smtpPass)
                        $smtp.Send($mail)
                        
                        $emailSent = $true
                        Write-Host "[Contact API] Notification email sent successfully to $smtpTo"
                    } catch {
                        $emailError = $_.Exception.Message
                        Write-Host "[Contact API] SMTP Error: $emailError"
                    }
                } else {
                    Write-Host "[Contact API] SMTP credentials not configured. Skipping email notification."
                }
                
                # Send Success Response
                $response.StatusCode = 200
                $response.ContentType = "application/json"
                $respObj = [PSCustomObject]@{
                    status = "success"
                    message = "Submission received successfully"
                    emailSent = $emailSent
                }
                if ($emailError) {
                    $respObj | Add-Member -MemberType NoteProperty -Name "emailError" -Value $emailError
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes(($respObj | ConvertTo-Json))
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                
            } catch {
                $response.StatusCode = 400
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"error","message":"Invalid request body"}')
                $response.ContentType = "application/json"
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                Write-Host "[Contact API] Error processing request: $_"
            }
            
            $response.Close()
            continue
        }

        if ($url -eq "/" -or $url -eq "") {
            $url = "/index.html"
        }
        
        # Clean path and construct physical path
        $cleanUrl = $url.TrimStart('/')
        $filePath = [System.IO.Path]::Combine((Get-Location).Path, $cleanUrl)
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set correct MIME type
            if ($filePath -like "*.html") { $response.ContentType = "text/html" }
            elseif ($filePath -like "*.css") { $response.ContentType = "text/css" }
            elseif ($filePath -like "*.js") { $response.ContentType = "application/javascript" }
            elseif ($filePath -like "*.png") { $response.ContentType = "image/png" }
            elseif ($filePath -like "*.svg") { $response.ContentType = "image/svg+xml" }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errorMessage = "404 Not Found: $url"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $listener.Stop()
}
