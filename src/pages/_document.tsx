// src/pages/_document.tsx

import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * Document personnalisé pour définir le thème DaisyUI.
 */
class MyDocument extends Document {
  render() {
    return (
      <Html data-theme="apoData"> {/* Application du thème personnalisé */}
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
