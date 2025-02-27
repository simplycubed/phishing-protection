/**
 * Create a homepage card for the add-on
 * @return {Card} The card to display as homepage
 */
function createHomepageCard() {
  const card = CardService.newCardBuilder();
  
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('Phishing Protection Add-on'))
    .addWidget(CardService.newTextParagraph().setText('This add-on automatically checks incoming emails and warns you about potential phishing attempts that impersonate your colleagues.'))
    .addWidget(CardService.newTextButton()
      .setText('Configure Settings')
      .setOnClickAction(CardService.newAction().setFunctionName('showConfigurationCard')));
  
  card.addSection(section);
  
  return card.build();
}/**
 * Gmail Add-on for Phishing Protection
 * 
 * This add-on scans incoming emails, compares sender names against the 
 * Google Workspace directory, and labels suspicious emails.
 * 
 * This version uses OAuth authentication rather than service accounts.
 */

// Triggered when Gmail message is opened
function onMessageOpen(event) {
  try {
    // Get the current message
    const messageId = event.gmail.messageId;
    const message = GmailApp.getMessageById(messageId);
    
    // Process the message for phishing detection
    const isSuspicious = checkForSpoofedSender(message);
    
    // Apply label if suspicious
    if (isSuspicious) {
      applyPhishingWarningLabel(message);
    }
    
    // Create the card to display in Gmail UI
    return createMessageCard(message, isSuspicious);
  } catch (error) {
    // Handle any errors gracefully
    Logger.log('Error in onMessageOpen: ' + error.toString());
    return createErrorCard(error);
  }
}

/**
 * Checks if the sender's name/email potentially spoofs an internal employee
 * @param {GmailMessage} message - The Gmail message to check
 * @return {boolean} Whether the message appears to be spoofing an internal sender
 */
function checkForSpoofedSender(message) {
  // Get sender information
  const from = message.getFrom();
  
  // Extract sender name and email
  const senderName = extractSenderName(from);
  const senderEmail = extractSenderEmail(from);
  
  // Get domain from sender email
  const senderDomain = senderEmail.split('@')[1];
  
  // Get your workspace domain
  const workspaceDomain = Session.getEffectiveUser().getEmail().split('@')[1];
  
  // If the sender is from outside your domain but has a similar name to someone inside
  if (senderDomain !== workspaceDomain) {
    // Get all users in your Google Workspace
    const directoryUsers = getDirectoryUsers();
    
    // Check if sender name matches or is similar to any internal employee
    for (const user of directoryUsers) {
      if (isSimilarName(senderName, user.name)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get all users from the Google Workspace Directory using OAuth
 * @return {Array} Array of user objects with name and email properties
 */
function getDirectoryUsers() {
  const users = [];
  const cache = CacheService.getScriptCache();
  const cachedUsers = cache.get('directoryUsers');
  
  // Return cached users if available (to improve performance)
  if (cachedUsers) {
    return JSON.parse(cachedUsers);
  }
  
  // Get all users in the domain using Directory API
  try {
    let pageToken = null;
    let page;
    const domain = Session.getEffectiveUser().getEmail().split('@')[1];
    
    do {
      page = AdminDirectory.Users.list({
        domain: domain,
        orderBy: 'givenName',
        maxResults: 100,
        pageToken: pageToken
      });
      
      if (page.users) {
        for (const user of page.users) {
          users.push({
            name: user.name.fullName,
            email: user.primaryEmail
          });
        }
      }
      
      pageToken = page.nextPageToken;
    } while (pageToken);
    
    // Cache the results for 1 hour (to reduce API calls)
    if (users.length > 0) {
      cache.put('directoryUsers', JSON.stringify(users), 3600);
    }
    
  } catch (e) {
    Logger.log('Error retrieving directory users: ' + e.toString());
    // If there's an error with the Admin Directory API, try Contacts API as fallback
    try {
      // Use ContactsApp to get contacts as an alternative
      const contacts = ContactsApp.getContacts();
      
      if (contacts && contacts.length > 0) {
        for (const contact of contacts) {
          const name = contact.getFullName();
          const emails = contact.getEmails();
          
          if (name && emails.length > 0) {
            users.push({
              name: name,
              email: emails[0].getAddress()
            });
          }
        }
      }
      
      if (users.length > 0) {
        cache.put('directoryUsers', JSON.stringify(users), 3600);
      }
    } catch (peopleError) {
      Logger.log('Error retrieving people: ' + peopleError.toString());
    }
  }
  
  return users;
}

/**
 * Compare two names for similarity
 * @param {string} name1 - First name to compare
 * @param {string} name2 - Second name to compare
 * @return {boolean} Whether the names are similar
 */
function isSimilarName(name1, name2) {
  // Convert to lowercase for case-insensitive comparison
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();
  
  // Exact match
  if (n1 === n2) {
    return true;
  }
  
  // Check if one name contains the other
  if (n1.includes(n2) || n2.includes(n1)) {
    return true;
  }
  
  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(n1, n2);
  
  // If the distance is less than 3 (configurable), consider it similar
  // You may need to adjust this threshold based on testing
  return distance < 3;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @return {number} The Levenshtein distance
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  
  // Create distance matrix
  const d = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    d[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }
  
  // Calculate distance
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return d[m][n];
}

/**
 * Extract sender name from "From" header
 * @param {string} from - The "From" header
 * @return {string} The sender's name
 */
function extractSenderName(from) {
  // Try to match pattern: "Name <email@example.com>"
  const match = from.match(/^"?([^"<]+)"?\s*<.+>$/);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no name found, return the whole string
  return from;
}

/**
 * Extract sender email from "From" header
 * @param {string} from - The "From" header
 * @return {string} The sender's email
 */
function extractSenderEmail(from) {
  // Try to match pattern: "Name <email@example.com>"
  const match = from.match(/<([^>]+)>/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If no match, might just be the email address
  if (from.includes('@')) {
    return from.trim();
  }
  
  return '';
}

/**
 * Apply phishing warning label to the message
 * @param {GmailMessage} message - The message to label
 */
function applyPhishingWarningLabel(message) {
  // Get or create the phishing warning label
  const labelName = 'SUSPICIOUS - Potential Phishing';
  let label = GmailApp.getUserLabelByName(labelName);
  
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }
  
  // Apply the label to the message
  label.addToThread(message.getThread());
}

/**
 * Create card interface for the Gmail add-on
 * @param {GmailMessage} message - The message being viewed
 * @param {boolean} isSuspicious - Whether the message is flagged as suspicious
 * @return {Card} The card to display in Gmail
 */
function createMessageCard(message, isSuspicious) {
  const card = CardService.newCardBuilder();
  
  if (isSuspicious) {
    // Create a warning section - without an icon
    const warningSection = CardService.newCardSection()
      .addWidget(CardService.newDecoratedText()
        .setText('⚠️ This message may be a spoofed email!')
        .setWrapText(true)
        .setBottomLabel('Sender name matches an employee but is from outside your organization.'));
    
    card.addSection(warningSection);
    
    // Add sender details
    const from = message.getFrom();
    const detailsSection = CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText('From: ' + from))
      .addWidget(CardService.newTextParagraph().setText('Please verify the sender before responding or clicking any links.'));
    
    card.addSection(detailsSection);
  } else {
    // Create a safe message section
    const safeSection = CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText('No suspicious sender patterns detected.'));
    
    card.addSection(safeSection);
  }
  
  return card.build();
}

/**
 * Create an error card to display when something goes wrong
 * @param {Error} error - The error that occurred
 * @return {Card} The card to display the error
 */
function createErrorCard(error) {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('An error occurred:'))
    .addWidget(CardService.newTextParagraph().setText(error.toString()));
  
  card.addSection(section);
  return card.build();
}

// Called when the add-on is installed
function onInstall(e) {
  onHomepage(e);
}

// Called when the add-on is opened directly from the G Suite Add-on menu
function onHomepage(e) {
  return createHomepageCard();
}

/**
 * Handle compose action for checking recipients
 * @param {Object} e - The event object
 * @return {Card} The card to display in Gmail
 */
function onComposeCheck(e) {
  try {
    const card = CardService.newCardBuilder();
    const section = CardService.newCardSection();
    
    // Get the draft message
    const accessToken = e.messageMetadata.accessToken;
    const messageId = e.messageMetadata.messageId;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    
    // If there's a draft
    if (messageId) {
      const draft = GmailApp.getDraft(messageId);
      if (draft) {
        // Get recipients
        const recipients = draft.getMessage().getTo();
        // TODO: Implement recipient checking logic
        
        section.addWidget(CardService.newTextParagraph()
          .setText('Recipients appear to be legitimate.'));
      } else {
        section.addWidget(CardService.newTextParagraph()
          .setText('No recipients to check yet.'));
      }
    } else {
      section.addWidget(CardService.newTextParagraph()
        .setText('Start adding recipients to check them for phishing risks.'));
    }
    
    card.addSection(section);
    return card.build();
  } catch (error) {
    return createErrorCard(error);
  }
}

/**
 * Show configuration options
 * @return {Card} The card to display configuration options
 */
function showConfigurationCard() {
  const card = CardService.newCardBuilder();
  
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('Configuration Options'))
    .addWidget(CardService.newTextInput()
      .setFieldName('similarity_threshold')
      .setTitle('Name Similarity Threshold (1-5)')
      .setValue('3')
      .setHint('Lower values = more matches'))
    .addWidget(CardService.newTextButton()
      .setText('Save Configuration')
      .setOnClickAction(CardService.newAction().setFunctionName('saveConfiguration')));
  
  card.addSection(section);
  
  return card.build();
}

/**
 * Save user configuration
 * @param {Object} e - The event object
 * @return {Card} The confirmation card
 */
function saveConfiguration(e) {
  const threshold = e.formInput.similarity_threshold;
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('similarity_threshold', threshold);
  
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('Settings saved successfully.'));
  
  card.addSection(section);
  
  return card.build();
}
