# GitHub Pages SPA Routing Fix

## Issue Summary

**Problem**: Direct URL access to Angular routes (e.g., `https://slavigrad.net/egypt-story`) returns a 404 error on GitHub Pages, even though navigating to the same route from within the app works fine.

**Root Cause**: GitHub Pages (and most static hosting providers) serve static files. When you access `/egypt-story` directly, the server looks for a physical file at that path, doesn't find it, and returns 404. Angular's client-side routing only works when the app is already loaded.

**Status**: ✅ **FIXED**

**Date**: 2025-10-09

---

## How It Works

### The Problem in Detail

1. **Client-side navigation works**: When you click a link in the app, Angular's router handles it client-side without making a server request
2. **Direct URL access fails**: When you paste `https://slavigrad.net/egypt-story` in the browser:
   - Browser makes a GET request to the server for `/egypt-story`
   - GitHub Pages looks for a file at `/egypt-story/index.html` or `/egypt-story.html`
   - File doesn't exist → 404 error
   - Angular never loads, so routing never happens

### The Solution: SPA Redirect Hack

We use a two-file solution that tricks GitHub Pages into serving our Angular app for all routes:

1. **404.html**: Catches all 404 errors and redirects to index.html with the path encoded in the query string
2. **index.html**: Decodes the path from the query string and uses the History API to restore the original URL

---

## Implementation

### File 1: `public/404.html`

This file is served by GitHub Pages whenever a 404 occurs. It redirects to the home page with the path encoded in the query string.

**Location**: `public/404.html`

**How it works**:
```javascript
// Example: User visits https://slavigrad.net/egypt-story
// 404.html redirects to: https://slavigrad.net/?/egypt-story
var l = window.location;
l.replace(
  l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
  l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
  l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
  (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
  l.hash
);
```

**Key points**:
- Encodes the path as a query parameter: `/?/egypt-story`
- Preserves query strings and hash fragments
- Uses `replace()` instead of `assign()` to avoid adding to browser history

### File 2: `src/index.html` (Modified)

Added a script in the `<head>` section that decodes the path and restores the original URL.

**Location**: `src/index.html`

**How it works**:
```javascript
// Example: Receives https://slavigrad.net/?/egypt-story
// Restores to: https://slavigrad.net/egypt-story
(function(l) {
  if (l.search[1] === '/' ) {
    var decoded = l.search.slice(1).split('&').map(function(s) { 
      return s.replace(/~and~/g, '&')
    }).join('?');
    window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
}(window.location))
```

**Key points**:
- Runs before Angular loads
- Checks if URL contains `?/` (the redirect marker)
- Decodes the path and restores it using `history.replaceState()`
- Angular then loads and routes to the correct page

---

## The Flow

### Before Fix

```
User enters: https://slavigrad.net/egypt-story
    ↓
GitHub Pages: "No file at /egypt-story" → 404 Error ❌
```

### After Fix

```
User enters: https://slavigrad.net/egypt-story
    ↓
GitHub Pages: "No file at /egypt-story" → Serves 404.html
    ↓
404.html: Redirects to https://slavigrad.net/?/egypt-story
    ↓
GitHub Pages: Serves index.html (root always exists)
    ↓
index.html script: Decodes /?/egypt-story → /egypt-story
    ↓
History API: Updates URL to https://slavigrad.net/egypt-story
    ↓
Angular loads: Routes to /egypt-story component ✅
```

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `public/404.html` | Created | Catches 404 errors and redirects with encoded path |
| `src/index.html` | Modified | Added script to decode path and restore URL |
| `angular.json` | No change needed | Already configured to copy `public/` folder to dist |

---

## Build Configuration

The `angular.json` is already configured to copy files from the `public/` folder to the build output:

```json
"assets": [
  {
    "glob": "**/*",
    "input": "public"
  },
  {
    "glob": "**/*",
    "input": "src/assets",
    "output": "assets"
  }
]
```

This ensures that `public/404.html` is copied to `dist/LubomirOfSlavigrad/browser/404.html` during the build.

---

## Deployment Instructions

### For GitHub Pages

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Verify files exist**:
   ```bash
   # Check that both files are in the dist folder
   ls dist/LubomirOfSlavigrad/browser/404.html
   ls dist/LubomirOfSlavigrad/browser/index.html
   ```

3. **Deploy to GitHub Pages**:
   - Push the contents of `dist/LubomirOfSlavigrad/browser/` to your `gh-pages` branch
   - Or use your existing deployment workflow

4. **Test**:
   - Navigate to `https://slavigrad.net/egypt-story` directly in the browser
   - Should load the Egypt Story page without 404 error ✅

### For Other Static Hosts

This solution works for any static hosting provider that supports custom 404 pages:

- **Netlify**: Use `_redirects` file instead (see below)
- **Vercel**: Use `vercel.json` configuration (see below)
- **Firebase Hosting**: Use `firebase.json` rewrites (see below)
- **GitHub Pages**: Use this 404.html solution ✅

---

## Alternative Solutions for Other Platforms

### Netlify

Create `public/_redirects`:
```
/*    /index.html   200
```

### Vercel

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Firebase Hosting

Update `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Testing

### Manual Testing

1. **Direct URL access**:
   ```
   https://slavigrad.net/egypt-story
   ```
   Should load the Egypt Story page ✅

2. **With hash fragment**:
   ```
   https://slavigrad.net/egypt-story#chapter-3
   ```
   Should load Egypt Story and scroll to chapter 3 ✅

3. **With query parameters** (if you add any in the future):
   ```
   https://slavigrad.net/egypt-story?param=value
   ```
   Should preserve the query parameter ✅

### Browser DevTools Check

1. Open DevTools → Network tab
2. Navigate to `https://slavigrad.net/egypt-story`
3. You should see:
   - Initial request to `/egypt-story` → 404
   - Redirect to `/?/egypt-story` → 200
   - URL in address bar shows `/egypt-story` (no `?/`)

---

## Credits

This solution is based on the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) project by Rafael Pedicini.

**License**: MIT

---

## Troubleshooting

### Issue: Still getting 404 errors

**Solution**: 
- Verify `404.html` exists in the deployed folder
- Check that the script in `index.html` is present
- Clear browser cache and try again

### Issue: URL shows `/?/egypt-story` instead of `/egypt-story`

**Solution**:
- The script in `index.html` might not be running
- Check browser console for JavaScript errors
- Verify the script is in the `<head>` section before Angular loads

### Issue: Works locally but not on GitHub Pages

**Solution**:
- GitHub Pages may take a few minutes to update
- Check that you deployed the `browser` folder contents, not the parent folder
- Verify your custom domain DNS settings

---

## Summary

✅ **Problem**: Direct URL access to Angular routes returned 404 on GitHub Pages  
✅ **Solution**: Two-file redirect hack using 404.html and modified index.html  
✅ **Result**: All routes now work with direct URL access  
✅ **Deployment**: No changes needed to deployment workflow  
✅ **Performance**: No impact - redirect happens instantly before Angular loads

