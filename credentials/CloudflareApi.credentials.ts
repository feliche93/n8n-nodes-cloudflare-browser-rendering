import {
	// IAuthenticateGeneric, // Removed unused import
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CloudflareApi implements ICredentialType {
	name = 'cloudflareApi';
	displayName = 'Cloudflare API';
	// Define the properties displayed in the credentials modal
	properties: INodeProperties[] = [
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			placeholder: 'Your Cloudflare Account ID',
			description:
				'You can find your Account ID in the Cloudflare dashboard URL (after /<ACCOUNT_ID>/) or on the right sidebar of the overview page.',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Your Cloudflare API Token',
			description:
				'Create an API token with Browser Rendering permissions (<a href="https://dash.cloudflare.com/profile/api-tokens">API Tokens</a>)',
			required: true,
		},
	];

	// The authenticate method is used by the HTTP Request node to make authenticated requests
	// Since this node will handle authentication itself, we don't need a complex authenticate block.
	// However, defining a test method is good practice.
	authenticate = undefined; // We will handle auth in the node execute method

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			// Use the token verify endpoint which doesn't require specific account permissions
			// baseURL: `=https://api.cloudflare.com/client/v4/accounts/{{$credentials.accountId}}`, // Removed baseURL
			url: 'https://api.cloudflare.com/client/v4/user/tokens/verify', // Use full URL
			// method: 'GET', // GET is default for tests
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};
}
