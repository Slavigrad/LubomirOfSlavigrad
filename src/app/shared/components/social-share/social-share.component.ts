import { Component, Input } from '@angular/core';


/**
 * Social Share Component
 * 
 * Provides buttons to share content on various social media platforms
 * and copy link to clipboard.
 * 
 * Features:
 * - Share on Twitter/X
 * - Share on LinkedIn
 * - Share on Facebook
 * - Copy link to clipboard
 * - Beautiful hover effects
 * - Toast notification on copy
 */

export interface ShareConfig {
  url: string;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-social-share',
  standalone: true,
  imports: [],
  template: `
    <div class="social-share-container">
      <h3 class="share-title">Share this story</h3>
    
      <div class="share-buttons">
        <!-- Twitter/X -->
        <button
          (click)="shareOnTwitter()"
          class="share-button twitter"
          aria-label="Share on Twitter"
          title="Share on Twitter">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>Twitter</span>
        </button>
    
        <!-- LinkedIn -->
        <button
          (click)="shareOnLinkedIn()"
          class="share-button linkedin"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span>LinkedIn</span>
        </button>
    
        <!-- Facebook -->
        <button
          (click)="shareOnFacebook()"
          class="share-button facebook"
          aria-label="Share on Facebook"
          title="Share on Facebook">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>
    
        <!-- Copy Link -->
        <button
          (click)="copyLink()"
          class="share-button copy"
          aria-label="Copy link"
          title="Copy link to clipboard">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <span>{{ copyButtonText }}</span>
        </button>
      </div>
    
      <!-- Toast notification -->
      @if (showToast) {
        <div class="toast">
          ✓ Link copied to clipboard!
        </div>
      }
    </div>
    `,
  styles: [`
    .social-share-container {
      position: relative;
      margin: 3rem 0;
      padding: 2rem;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      text-align: center;
    }

    .share-title {
      font-size: 1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .share-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      align-items: center;
    }

    .share-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .share-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .share-button:active {
      transform: translateY(0);
    }

    .share-button.twitter {
      background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
    }

    .share-button.twitter:hover {
      background: linear-gradient(135deg, #0d8bd9, #1DA1F2);
    }

    .share-button.linkedin {
      background: linear-gradient(135deg, #0077B5, #005885);
    }

    .share-button.linkedin:hover {
      background: linear-gradient(135deg, #005885, #0077B5);
    }

    .share-button.facebook {
      background: linear-gradient(135deg, #1877F2, #0d5dbf);
    }

    .share-button.facebook:hover {
      background: linear-gradient(135deg, #0d5dbf, #1877F2);
    }

    .share-button.copy {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    }

    .share-button.copy:hover {
      background: linear-gradient(135deg, #6d28d9, #8b5cf6);
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      font-weight: 600;
      z-index: 10001;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .share-buttons {
        flex-direction: column;
        width: 100%;
      }

      .share-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SocialShareComponent {
  @Input() config: ShareConfig = {
    url: '',
    title: '',
    description: ''
  };

  copyButtonText = 'Copy Link';
  showToast = false;

  /**
   * Share on Twitter/X
   */
  shareOnTwitter(): void {
    const text = encodeURIComponent(this.config.title);
    const url = encodeURIComponent(this.config.url);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  /**
   * Share on LinkedIn
   */
  shareOnLinkedIn(): void {
    const url = encodeURIComponent(this.config.url);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }

  /**
   * Share on Facebook
   */
  shareOnFacebook(): void {
    const url = encodeURIComponent(this.config.url);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  /**
   * Copy link to clipboard
   */
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.config.url);
      this.copyButtonText = 'Copied!';
      this.showToast = true;

      // Reset after 2 seconds
      setTimeout(() => {
        this.copyButtonText = 'Copy Link';
        this.showToast = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      this.fallbackCopyLink();
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyLink(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.config.url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.copyButtonText = 'Copied!';
      this.showToast = true;
      
      setTimeout(() => {
        this.copyButtonText = 'Copy Link';
        this.showToast = false;
      }, 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  }
}

