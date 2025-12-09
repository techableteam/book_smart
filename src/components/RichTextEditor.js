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
      </style>
    </head>
    <body>
      <div id="toolbar">
        <button id="btn-bold" class="toolbar-btn" onclick="toggleFormat('bold')" title="Bold"><b>B</b></button>
        <button id="btn-italic" class="toolbar-btn" onclick="toggleFormat('italic')" title="Italic"><i>I</i></button>
        <button id="btn-underline" class="toolbar-btn" onclick="toggleFormat('underline')" title="Underline"><u>U</u></button>
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
        editor.addEventListener('selectionchange', updateButtonStates);
        editor.addEventListener('mouseup', updateButtonStates);
        editor.addEventListener('keyup', updateButtonStates);
        
        editor.addEventListener('paste', function(e) {
          e.preventDefault();
          // Get pasted text with formatting
          const text = (e.clipboardData || window.clipboardData).getData('text/html') || 
                       (e.clipboardData || window.clipboardData).getData('text/plain');
          
          // Insert HTML if available, otherwise plain text
          if (text.includes('<') || text.includes('&')) {
            document.execCommand('insertHTML', false, text);
          } else {
            document.execCommand('insertText', false, text);
          }
          setTimeout(updateButtonStates, 10);
          updateContent();
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

