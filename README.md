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

1. Checking the sender of every incoming email against your organization's Google Workspace directory
2. Identifying when a sender's name matches or closely resembles an employee but comes from an external domain
3. Applying a clear warning label to suspicious emails
4. Displaying a warning notification in the Gmail sidebar when viewing these emails

The add-on uses a hybrid approach to ensure comprehensive protection:

- Background scanning of new emails every 5 minutes
- Real-time checking when a user opens an email
- Smart caching of directory data for performance optimization

## Features

- **Automated Phishing Detection**: Identifies potential name spoofing attacks without user intervention
- **Visual Warnings**: Clear labels and in-Gmail notifications for suspicious emails
- **Directory Integration**: Directly uses your Google Workspace directory via OAuth
- **Performance Optimized**: Efficient caching of directory data and intelligent processing
- **User Configurable**: Adjustable sensitivity settings for name matching
- **Low Resource Impact**: Designed to work efficiently within Google's quota limits

## Installation

### For Administrators

1. Go to [Google Workspace Marketplace](https://workspace.google.com/marketplace) (or click on the published link once available)
2. Search for "Gmail Phishing Protection"
3. Click "Install" and follow the prompts
4. Grant the necessary permissions
5. Deploy to your organization

### For Development/Self-Hosting

1. Create a new Google Apps Script project
2. Copy the `Code.gs` file content into your project
3. Create an `appsscript.json` file with the provided manifest
4. Enable the Admin Directory API in Advanced Services
5. Deploy as a Gmail add-on
6. Run the `initialSetup()` function once to configure background processing

## Configuration

### Required Permissions

The add-on requires these permissions:

- Gmail read/modify access (to check emails and apply labels)
- Directory API access (to verify employee names)
- Script execution privileges (for background processing)

### User Settings

Users can configure:

- **Similarity Threshold** (1-5): Lower values catch more potential spoofing but may increase false positives
- **Background Processing**: Enable/initialize automated checking of incoming emails

### Admin Configuration

No special admin configuration is required beyond standard add-on deployment in Google Workspace.

## How It Works

1. **Directory Caching**:

   - Employee directory data is cached daily for optimal performance
   - Multi-level caching strategy uses both Cache and Properties storage

2. **Email Processing**:

   - Batch processing runs every 5 minutes to check recent emails
   - On-open processing checks any emails missed by batch processing
   - Smart tracking avoids duplicate processing

3. **Phishing Detection**:

   - Extracts sender name and email domain
   - Skips internal emails quickly for efficiency
   - Compares sender name against directory using fuzzy matching
   - Uses configurable Levenshtein distance for name similarity

4. **Warning System**:

   - Applies "SUSPICIOUS - Potential Phishing" label to flagged emails
   - Displays warning card when viewing suspicious emails
   - Provides detailed sender information for verification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This add-on is designed to help identify potential phishing attempts but should not be the only security measure your organization employs. No automated tool can catch 100% of phishing attempts, and this add-on is most effective as part of a comprehensive security strategy that includes user education and other technical controls.
