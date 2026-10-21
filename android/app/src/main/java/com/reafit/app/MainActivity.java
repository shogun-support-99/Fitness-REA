package com.reafit.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebBackForwardList;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

/**
 * REA Fit — thin Android shell around the bundled web app.
 *
 * Everything the app stores (accounts, workouts, routines, feed) lives in
 * the WebView's DOM storage, which is private app data on the phone: it
 * survives restarts and stays out of any cloud. Nothing is uploaded — the
 * only network traffic is the exercise-image CDN.
 */
public class MainActivity extends Activity {

    // #/app boots straight into the tracker — the marketing page is web-only
    private static final String ROOT =
            "https://appassets.androidplatform.net/assets/index.html#/app";

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        // user data lives on the phone, inside the app's private storage
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        // the app is fully bundled — no file or content access needed
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        webView.setBackgroundColor(Color.parseColor("#000000"));

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });

        setContentView(webView);

        if (savedInstanceState != null) {
            WebBackForwardList restored = webView.restoreState(savedInstanceState);
            if (restored == null) {
                webView.loadUrl(ROOT);
            }
        } else {
            webView.loadUrl(ROOT);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // hash-routed app: walk the in-app history first
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
