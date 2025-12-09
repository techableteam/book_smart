/**
 * Formats terms content for display in WebView
 * Handles both HTML and plain text content
 * 
 * @param {string} content - The content to format (can be HTML or plain text)
 * @returns {string} - Formatted HTML string ready for WebView
 */
export const formatTermsContent = (content) => {
  if (!content) {
    return '<p>No content available</p>';
  }

  // Check if content contains HTML tags (simple detection)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
  
  if (hasHtmlTags) {
    // Content is already HTML, use it as-is
    return content;
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
    
    // Wrap in paragraph tags for proper spacing
    return `<p>${withBreaks}</p>`;
  }
};

