import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

const RichTextEditor = ({ value, onChange, placeholder, style }) => {
  const webViewRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const fontSize = Math.round(RFValue(14));

  // HTML template for the rich text editor
  const editorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ` + fontSize + `px;
          line-height: 1.6;
          padding: 12px;
          background-color: #f5f5f5;
          color: #424242;
        }
        #editor {
          min-height: 300px;
          max-height: 600px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          overflow-y: auto;
          outline: none;
        }
        #editor:empty:before {
          content: "${placeholder || 'Enter text here...'}";
          color: #999;
        }
        #toolbar {
          background-color: #e0e0e0;
          padding: 8px;
          border-radius: 8px 8px 0 0;
          border: 1px solid #ddd;
          border-bottom: none;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .toolbar-btn {
          padding: 6px 12px;
          background-color: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          color: #424242;
        }
        .toolbar-btn:hover {
          background-color: #e0e0e0;
        }
        .toolbar-btn.active {
          background-color: #2196F3;
          color: white;
          border-color: #2196F3;
        }
        .font-size-select {
          padding: 6px 8px;
          background-color: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          color: #424242;
          min-width: 60px;
        }
        .font-size-select:hover {
          background-color: #e0e0e0;
        }
        .font-size-select:focus {
          outline: 2px solid #2196F3;
          border-color: #2196F3;
        }
      </style>
    </head>
    <body>
      <div id="toolbar">
        <button id="btn-bold" class="toolbar-btn" onclick="toggleFormat('bold')" title="Bold"><b>B</b></button>
        <button id="btn-italic" class="toolbar-btn" onclick="toggleFormat('italic')" title="Italic"><i>I</i></button>
        <button id="btn-underline" class="toolbar-btn" onclick="toggleFormat('underline')" title="Underline"><u>U</u></button>
        <select id="font-size-select" class="font-size-select" onchange="applyFontSize(this.value)" title="Font Size">
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14" selected>14</option>
          <option value="15">15</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
        </select>
      </div>
      <div id="editor" contenteditable="true"></div>
      <script>
        let editor = document.getElementById('editor');
        let isReady = false;

        function updateButtonStates() {
          const btnBold = document.getElementById('btn-bold');
          const btnItalic = document.getElementById('btn-italic');
          const btnUnderline = document.getElementById('btn-underline');
          
          // Check current formatting state
          const isBold = document.queryCommandState('bold');
          const isItalic = document.queryCommandState('italic');
          const isUnderline = document.queryCommandState('underline');
          
          // Update button active states
          if (isBold) {
            btnBold.classList.add('active');
          } else {
            btnBold.classList.remove('active');
          }
          
          if (isItalic) {
            btnItalic.classList.add('active');
          } else {
            btnItalic.classList.remove('active');
          }
          
          if (isUnderline) {
            btnUnderline.classList.add('active');
          } else {
            btnUnderline.classList.remove('active');
          }
        }

        function applyFontSize(size) {
          const fontSize = parseInt(size);
          if (isNaN(fontSize)) return;
          
          // Apply font size to selected text using execCommand with style
          const selection = window.getSelection();
          
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            if (range.collapsed) {
              // No selection - insert span at cursor for next typed text
              const span = document.createElement('span');
              span.style.fontSize = fontSize + 'px';
              span.innerHTML = '&nbsp;';
              range.insertNode(span);
              range.setStartAfter(span);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // Has selection - use insertHTML to ensure font size is saved in HTML content
              const selectedText = range.toString();
              if (selectedText) {
                // Delete current selection and insert with font size
                range.deleteContents();
                const html = '<span style="font-size: ' + fontSize + 'px !important;">' + selectedText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
                document.execCommand('insertHTML', false, html);
              } else {
                // Fallback: try surroundContents
                try {
                  const span = document.createElement('span');
                  span.style.fontSize = fontSize + 'px !important';
                  range.surroundContents(span);
                } catch (e) {
                  // If that fails, extract and wrap
                  const contents = range.extractContents();
                  const span = document.createElement('span');
                  span.style.fontSize = fontSize + 'px !important';
                  span.appendChild(contents);
                  range.insertNode(span);
                }
              }
            }
          } else {
            // Fallback: use insertHTML
            document.execCommand('insertHTML', false, '<span style="font-size: ' + fontSize + 'px;">' + (selection.toString() || '&nbsp;') + '</span>');
          }
          
          // Clean up any font tags and convert to span with style
          setTimeout(() => {
            const fontElements = editor.querySelectorAll('font[size]');
            fontElements.forEach(font => {
              const span = document.createElement('span');
              const computedSize = window.getComputedStyle(font).fontSize;
              span.style.fontSize = computedSize || fontSize + 'px';
              while (font.firstChild) {
                span.appendChild(font.firstChild);
              }
              font.parentNode.replaceChild(span, font);
            });
            
            // Ensure all font-size styles are properly set and saved
            const allSpans = editor.querySelectorAll('span');
            allSpans.forEach(span => {
              if (span.style.fontSize) {
                // Ensure font-size is explicitly set in style attribute
                span.setAttribute('style', span.getAttribute('style') || '');
                if (!span.style.fontSize.includes('!important')) {
                  span.style.fontSize = span.style.fontSize.replace('px', '') + 'px !important';
                }
              }
            });
            
            updateFontSizeDropdown();
            updateContent();
          }, 10);
          
          editor.focus();
        }

        function updateFontSizeDropdown() {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const element = container.nodeType === 3 ? container.parentElement : container;
            if (element) {
              const computedStyle = window.getComputedStyle(element);
              const fontSize = parseInt(computedStyle.fontSize);
              const select = document.getElementById('font-size-select');
              if (select && fontSize) {
                select.value = fontSize.toString();
              }
            }
          }
        }

        function toggleFormat(cmd) {
          // Check if the clicked format is already active
          const isCurrentlyActive = document.queryCommandState(cmd);
          
          // Remove all formatting first
          if (document.queryCommandState('bold')) {
            document.execCommand('bold', false, null);
          }
          if (document.queryCommandState('italic')) {
            document.execCommand('italic', false, null);
          }
          if (document.queryCommandState('underline')) {
            document.execCommand('underline', false, null);
          }
          
          // If the clicked format was not active, apply it now
          // If it was active, we've already removed it above
          if (!isCurrentlyActive) {
            document.execCommand(cmd, false, null);
          }
          
          editor.focus();
          updateButtonStates();
          updateContent();
        }

        function updateContent() {
          if (isReady) {
            const content = editor.innerHTML;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'content-change',
              content: content
            }));
          }
        }

        editor.addEventListener('input', function() {
          updateButtonStates();
          updateContent();
        });
        
        // Update button states when selection changes
        editor.addEventListener('selectionchange', function() {
          updateButtonStates();
          updateFontSizeDropdown();
        });
        editor.addEventListener('mouseup', function() {
          updateButtonStates();
          updateFontSizeDropdown();
        });
        editor.addEventListener('keyup', function() {
          updateButtonStates();
          updateFontSizeDropdown();
        });
        
        editor.addEventListener('paste', function(e) {
          e.preventDefault();
          // Get pasted text with formatting
          let html = (e.clipboardData || window.clipboardData).getData('text/html');
          const plain = (e.clipboardData || window.clipboardData).getData('text/plain');
          const baseFontSize = ` + fontSize + `;
          
          if (html) {
            // Normalize font sizes in pasted HTML to base font size
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Convert font tags to spans and normalize size
            const fontElements = tempDiv.querySelectorAll('font[size]');
            fontElements.forEach(font => {
              const span = document.createElement('span');
              span.style.fontSize = baseFontSize + 'px';
              while (font.firstChild) {
                span.appendChild(font.firstChild);
              }
              font.parentNode.replaceChild(span, font);
            });
            
            // Normalize ALL font sizes to base font size
            const allElements = tempDiv.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.style) {
                // Force all font sizes to base size
                el.style.fontSize = baseFontSize + 'px';
              }
              // Remove size attribute
              el.removeAttribute('size');
            });
            
            // Also handle text nodes that might not be in styled elements
            const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
              const parent = node.parentElement;
              if (parent && (!parent.style || !parent.style.fontSize)) {
                textNodes.push({node: node, parent: parent});
              }
            }
            
            // Wrap unstyled text nodes
            textNodes.forEach(({node, parent}) => {
              if (parent.tagName !== 'SPAN' || !parent.style.fontSize) {
                const span = document.createElement('span');
                span.style.fontSize = baseFontSize + 'px';
                parent.insertBefore(span, node);
                span.appendChild(node);
              }
            });
            
            document.execCommand('insertHTML', false, tempDiv.innerHTML);
          } else {
            // Plain text - insert with base font size
            const span = '<span style="font-size: ' + baseFontSize + 'px;">' + plain.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
            document.execCommand('insertHTML', false, span);
          }
          
          // Final cleanup after paste - ensure all content has base font size
          setTimeout(() => {
            const allElements = editor.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.style && el.style.fontSize) {
                const currentSize = parseInt(el.style.fontSize);
                // If font size differs from base, normalize it
                if (Math.abs(currentSize - baseFontSize) > 1) {
                  el.style.fontSize = baseFontSize + 'px';
                }
              }
              // Remove any remaining font tags
              if (el.tagName === 'FONT' && el.hasAttribute('size')) {
                const span = document.createElement('span');
                span.style.fontSize = baseFontSize + 'px';
                while (el.firstChild) {
                  span.appendChild(el.firstChild);
                }
                el.parentNode.replaceChild(span, el);
              }
            });
            
            updateButtonStates();
            updateFontSizeDropdown();
            updateContent();
          }, 50);
        });

        // Handle keyboard shortcuts
        editor.addEventListener('keydown', function(e) {
          // Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
          if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
              e.preventDefault();
              toggleFormat('bold');
            } else if (e.key === 'i') {
              e.preventDefault();
              toggleFormat('italic');
            } else if (e.key === 'u') {
              e.preventDefault();
              toggleFormat('underline');
            }
          }
        });

        // Set initial content
        function setContent(html) {
          editor.innerHTML = html || '';
          isReady = true;
          setTimeout(updateButtonStates, 100);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'editor-ready'
          }));
        }

        // Listen for messages from React Native
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'set-content') {
            setContent(event.data.content);
          }
        });

        // Initialize
        window.addEventListener('load', function() {
          isReady = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'editor-ready'
          }));
        });
      </script>
    </body>
    </html>
  `;

  useEffect(() => {
    if (editorReady && webViewRef.current && value !== undefined) {
      // Send content to editor
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'set-content',
          content: value || ''
        })
      );
    }
  }, [value, editorReady]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'editor-ready') {
        setEditorReady(true);
        // Set initial content
        if (value) {
          setTimeout(() => {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: 'set-content',
                content: value
              })
            );
          }, 100);
        }
      } else if (data.type === 'content-change') {
        if (onChange) {
          onChange(data.content);
        }
      }
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: editorHTML }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webview: {
    backgroundColor: 'transparent',
    minHeight: 300,
    maxHeight: 600,
  },
});

export default RichTextEditor;

