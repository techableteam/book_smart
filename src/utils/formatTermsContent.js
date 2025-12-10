/**
 * Formats terms content for display in WebView
 * Handles both HTML and plain text content
 * Normalizes font sizes to be consistent
 * 
 * @param {string} content - The content to format (can be HTML or plain text)
 * @param {number} fontSize - The desired font size (default 14)
 * @returns {string} - Formatted HTML string ready for WebView
 */
export const formatTermsContent = (content, fontSize = 14) => {
  if (!content) {
    return '<p style="font-size: ' + fontSize + 'px;">No content available</p>';
  }

  // Check if content contains HTML tags (simple detection)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
  
  if (hasHtmlTags) {
    // Content is HTML - normalize font sizes
    // Remove inline font-size styles and set consistent size
    let normalized = content
      .replace(/style="[^"]*font-size:[^";]*;?[^"]*"/gi, '') // Remove font-size from style attributes
      .replace(/style="([^"]*)"/gi, (match, styles) => {
        // Keep other styles but add font-size
        const cleanStyles = styles.trim();
        return cleanStyles ? `style="${cleanStyles}; font-size: ${fontSize}px;"` : `style="font-size: ${fontSize}px;"`;
      })
      .replace(/<([^>]+)>/g, (match, tagContent) => {
        // Add font-size to tags without style attribute
        if (!tagContent.includes('style=') && /^[a-z]+/i.test(tagContent)) {
          return '<' + tagContent + ' style="font-size: ' + fontSize + 'px;">';
        }
        return match;
      });
    
    // Wrap in a container with consistent font size
    return '<div style="font-size: ' + fontSize + 'px;">' + normalized + '</div>';
  } else {
    // Content is plain text - convert newlines to <br> and escape HTML special characters
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Convert newlines to <br> tags and preserve multiple spaces
    const withBreaks = escaped
      .replace(/\n/g, '<br>')
      .replace(/\r\n/g, '<br>')
      .replace(/\r/g, '<br>');
    
    // Wrap in paragraph tags with consistent font size
    return `<p style="font-size: ${fontSize}px;">${withBreaks}</p>`;
  }
};

