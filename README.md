# n8n-nodes-cloudflare-browser-rendering

This is an n8n community node. It lets you use the [Cloudflare Browser Rendering API](https://developers.cloudflare.com/browser-rendering/) in your n8n workflows.

Cloudflare Browser Rendering allows you to programmatically control a headless browser instance to render web pages, extract content, take screenshots, and more, directly from Cloudflare's edge network.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- **Get Content**: Fetches the fully rendered HTML content of a given URL or raw HTML string.
- **Get Links**: Extracts all links (optionally only visible links) from a given URL.
- **Take Screenshot**: Captures a screenshot (PNG, JPEG, or WebP) of a given URL or raw HTML string, with options for format, quality, and full page capture.

## Credentials

To use this node, you need to create Cloudflare API credentials:

1.  **Account ID**: You need your Cloudflare Account ID.
    - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - Select any of your domains.
    - Your Account ID is shown in the URL (`https://dash.cloudflare.com/<ACCOUNT_ID>/...`) and on the right sidebar of the domain's **Overview** page.
2.  **API Token**: You need a Cloudflare API Token with permission to use Browser Rendering.
    - Navigate to **My Profile** > **API Tokens** ([direct link](https://dash.cloudflare.com/profile/api-tokens)).
    - Click **Create Token**.
    - Under **Custom token**, click the **Get started** button.
    - Give your token a descriptive name (e.g., "n8n Browser Rendering").
    - Under **Permissions**, select:
      - **Account** (from the first dropdown)
      - **Workers Browser Rendering** (from the second dropdown)
      - **Read** (from the third dropdown)
    - Click **+ Add more** and select the same permissions again, but choose **Edit** from the third dropdown.
    - Ensure the token has the necessary permissions: `Account` > `Workers Browser Rendering` > `Read`.
    - Ensure the token also has the permission: `Account` > `Workers Browser Rendering` > `Edit`.
    - Under **Account Resources**, select the specific account(s) this token should apply to (usually `Include` > `Specific account` > `Your Account`).
    - (Optional) Configure **Client IP Address Filtering** and **TTL** if needed.
    - Continue to summary and click **Create Token**.
    - **Important**: Copy the generated API token immediately. You won't be able to see it again.
3.  **Add Credentials in n8n**: Use the gathered **Account ID** and **API Token** to create new `Cloudflare API` credentials in n8n.

## Compatibility

This node was developed and tested using n8n version 1.x.x (Please specify the versions you test against).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Cloudflare Browser Rendering Documentation](https://developers.cloudflare.com/browser-rendering/)
- [Cloudflare API Token Documentation](https://developers.cloudflare.com/fundamentals/api/reference/api-tokens/)
