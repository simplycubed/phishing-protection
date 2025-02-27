# Gmail Phishing Protection Add-on

![Gmail Phishing Protection](https://www.gstatic.com/images/icons/material/system/1x/security_black_48dp.png)

A Gmail add-on that helps protect your organization from sophisticated phishing attacks that impersonate your colleagues.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## The Problem

Social engineering attacks, particularly email phishing that impersonates trusted colleagues, remain one of the most common and effective security threats organizations face today. Attackers often:

1. Create email addresses with names matching your employees but from external domains
2. Craft convincing content that appears to come from someone the recipient trusts
3. Request sensitive information, credential entry, or malicious file downloads

These attacks are particularly effective because they exploit human trust rather than technical vulnerabilities.

## The Solution

This Gmail add-on provides an automated layer of protection by:

1. Checking the sender of every email when it's opened against your organization's Google Workspace directory
2. Identifying when a sender's name matches or closely resembles an employee but comes from an external domain
3. Applying a clear bright red warning label to suspicious emails
4. Displaying a warning notification in the Gmail sidebar when viewing these emails

## Features

- **Automated Phishing Detection**: Identifies potential name spoofing attacks when users view emails
- **Visual Warnings**: Clear red labels and in-Gmail notifications for suspicious emails
- **Directory Integration**: Directly uses your Google Workspace directory via OAuth
- **Performance Optimized**: Efficient caching of directory data for faster processing
- **User Configurable**: Adjustable sensitivity settings for name matching
- **Fail-safe Design**: Falls back to personal contacts if directory access fails

## Installation

### For Administrators

1. Go to [Google Workspace Marketplace](https://workspace.google.com/marketplace) (or click on the published link once available)
2. Search for "Gmail Phishing Protection"
3. Click "Install" and follow the prompts
4. Grant the necessary permissions
5. Deploy to your organization

### For Development/Self-Hosting

1. Create a new Google Apps Script project:
   - Go to [Google Apps Script](https://script.google.com/)
   - Click "New Project"
   - Delete any template code in the editor

2. Copy the `Code.gs` file content into your project:
   - Paste the code into the script editor
   - Rename the file to "Code.gs" if needed

3. Create an `appsscript.json` file with the provided manifest:
   - Click on the "+" icon next to "Files" in the left sidebar
   - Choose "Script"
   - Name it "appsscript.json"
   - Paste the manifest content

4. Enable the necessary Google APIs:

   **Enable the Admin Directory API in Apps Script:**
   - In your Apps Script project, click on "Services" (+ icon)
   - Scroll down and select "Admin Directory API"
   - Click "Add"

   **Enable APIs in Google Cloud Console:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable the following APIs:
     - Gmail API
     - Admin SDK API
     - People API (for contacts)
   - Configure the OAuth consent screen:
     - Go to "APIs & Services" > "OAuth consent screen"
     - Select "Internal" (for Workspace deployments)
     - Fill in the required app information
     - Add the necessary scopes (same as in the appsscript.json file)

5. Connect your Apps Script project to your Google Cloud project:
   - In Apps Script, click on the ⚙️ (Settings) icon
   - Under "Google Cloud Platform (GCP) Project", click "Change project"
   - Enter your GCP project number (found in GCP Console > Dashboard)
   - Click "Set project"

6. Deploy as a Gmail add-on:
   - Click "Deploy" > "New deployment"
   - Select "Gmail add-on" as the deployment type
   - Fill in the description (optional)
   - Click "Deploy"
   - Copy the deployment URL for organization-wide deployment

7. Deploy to your organization (for admins):
   - Go to [Google Admin Console](https://admin.google.com/)
   - Navigate to "Apps" > "Google Workspace Marketplace apps"
   - Click "Add app" > "Add custom app" > "Add by URL"
   - Paste the deployment URL from the previous step
   - Configure access settings for your organization

## Configuration

### Required Permissions

The add-on requires these permissions:

- Gmail read/modify access (to check emails and apply labels)
- Directory API access (to verify employee names)
- Contacts API access (as a fallback for directory information)

### User Settings

Users can configure:

- **Similarity Threshold** (1-5): Lower values catch more potential spoofing but may increase false positives

### Admin Configuration

No special admin configuration is required beyond standard add-on deployment in Google Workspace.

## How It Works

1. **Directory Access**:
   - Employee directory data is accessed via the Google Workspace Directory API
   - Directory data is cached for one hour to improve performance
   - Falls back to personal contacts if directory access fails

2. **Email Processing**:
   - When a user opens an email, the add-on checks the sender
   - External emails are analyzed for name similarity to internal contacts
   - Internal emails are automatically marked as safe

3. **Phishing Detection**:
   - Extracts sender name and email domain
   - Skips internal emails quickly for efficiency
   - Compares sender name against directory using fuzzy matching
   - Uses configurable Levenshtein distance for name similarity

4. **Warning System**:
   - Applies "SUSPICIOUS - Potential Phishing" bright red label to flagged emails
   - Displays warning card when viewing suspicious emails
   - Provides detailed sender information for verification

## Troubleshooting

Common issues and solutions:

1. **Directory API Access Issues**:
   - Verify the Admin SDK API is enabled in Google Cloud Console
   - Ensure the user has appropriate admin permissions
   - Check the execution logs in Apps Script editor for specific errors

2. **Add-on Not Appearing in Gmail**:
   - Refresh Gmail completely (Ctrl+F5/Cmd+R)
   - Verify the add-on is installed in Gmail settings
   - Check browser console for any errors

3. **Label Not Appearing**:
   - Gmail sometimes takes a few moments to display new labels
   - Refresh Gmail or reload the page
   - Check if the label exists in the Labels section of Gmail settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Enhancement Ideas

Potential future improvements:

- Background processing to check emails as they arrive (every 5 minutes)
- More sophisticated phishing detection algorithms
- User reporting of false positives/negatives
- Dashboard for security teams to monitor threats
- Integration with other security tools

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This add-on is designed to help identify potential phishing attempts but should not be the only security measure your organization employs. No automated tool can catch 100% of phishing attempts, and this add-on is most effective as part of a comprehensive security strategy that includes user education and other technical controls.
