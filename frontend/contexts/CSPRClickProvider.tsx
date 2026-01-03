'use client'

import React from 'react'
import Script from 'next/script'

export function CSPRClickProvider({ children }: { children: React.ReactNode }) {

  return (
    <>
      {/* Define options before CSPR.click script loads */}
      <Script id="csprclick-options" strategy="beforeInteractive">
        {`
          window.clickUIOptions = {
            uiContainer: 'csprclick-ui',
            rootAppElement: '#app',
            showTopBar: true,
          };
          window.clickSDKOptions = {
            appName: 'FlipDuel',
            appId: 'csprclick-template',
            providers: ['casper-wallet', 'ledger', 'metamask-snap', 'casperdash'],
          };

          // Callback that CSPR.click SDK calls when ready
          window.csprClickSDKAsyncInit = function() {
            console.log('✅ CSPR.click SDK initialized via callback');
            console.log('🔍 window.csprclick:', window.csprclick);

            // Verify the SDK is ready
            if (window.csprclick) {
              console.log('✅ window.csprclick is available!');
              console.log('📋 Methods:', Object.keys(window.csprclick));
            } else {
              console.error('❌ window.csprclick is still undefined');
            }
          };

          console.log('📝 CSPR.click options defined');
        `}
      </Script>
      <Script
        src="https://cdn.cspr.click/ui/v1.9.0/csprclick-client-1.9.0.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('📦 CSPR.click script tag loaded')
        }}
        onError={(e) => {
          console.error('❌ Failed to load CSPR.click script:', e)
        }}
      />
      <div id="app">
        <div id="csprclick-ui"></div>
        <div id="content">{children}</div>
      </div>
    </>
  )
}
