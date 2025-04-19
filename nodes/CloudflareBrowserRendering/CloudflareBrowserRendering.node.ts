import type {
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	// JsonObject, // Removed unused import
} from 'n8n-workflow';
// import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'; // Removed unused NodeConnectionType
// import { NodeOperationError } from 'n8n-workflow'; // Removed unused NodeOperationError

// Define the structure for screenshot options based on Cloudflare docs (implicitly)
// We'll use a fixed collection for simplicity
const screenshotOptionsFields: INodeProperties[] = [
	{
		displayName: 'Format',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'PNG', value: 'png' },
			{ name: 'JPEG', value: 'jpeg' },
			{ name: 'WebP', value: 'webp' },
		],
		default: 'png',
		description: 'The image format for the screenshot',
	},
	{
		displayName: 'Full Page',
		name: 'fullPage',
		type: 'boolean',
		default: false,
		description: 'Whether to capture the full scrollable page. Defaults to false (viewport only).',
	},
	{
		displayName: 'Omit Background',
		name: 'omitBackground',
		type: 'boolean',
		default: false,
		description:
			'Whether to hide the default white background and allow capturing screenshots with transparency. Defaults to false.',
	},
	{
		displayName: 'Quality (JPEG/WebP Only)',
		name: 'quality',
		type: 'number',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		default: 80,
		description: 'The quality of the image, between 0-100. Not applicable to PNG.',
		displayOptions: {
			show: {
				type: ['jpeg', 'webp'],
			},
		},
	},
];

export class CloudflareBrowserRendering implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cloudflare Browser Rendering',
		name: 'cloudflareBrowserRendering',
		icon: 'file:cloudflareBrowserRendering.svg', // You might need to create this SVG icon
		group: ['utility'], // Or ['transform'], ['external-apis'] etc.
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Uses Cloudflare Browser Rendering API to interact with web pages',
		defaults: {
			name: 'Cloudflare Browser Rendering',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cloudflareApi',
				required: true,
			},
		],

		// Define default request settings for all operations
		requestDefaults: {
			baseURL:
				'={{ `https://api.cloudflare.com/client/v4/accounts/${$credentials.accountId}/browser-rendering` }}',
			headers: {
				Authorization: '={{ `Bearer ${$credentials.apiToken}` }}',
				'Content-Type': 'application/json',
			},
			method: 'POST', // All operations use POST
			// Default error handling - relying on n8n's default behavior (throw on non-2xx)
			// Removed custom errorHandling block as it's not standard in requestDefaults
		},

		properties: [
			// Operation Selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true, // Prevents expression evaluation
				options: [
					{
						name: 'Get Content',
						value: 'content',
						action: 'Get rendered HTML content',
						routing: {
							request: {
								url: '/content',
								// Send URL or HTML in the body
								body: {
									// 'send' moved into 'body'
									mode: 'raw', // Use raw mode for JSON body
									json: true,
									// Define properties to send in the body
									value: JSON.stringify({
										url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
										html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
										// Add reject options if needed later
									}),
								},
							},
							// Define how to handle the response
							output: {
								// Assume the main result is directly in the body
								// Adjust if Cloudflare wraps it (e.g., in a 'result' field)
								// Based on docs, it seems the HTML content is the direct response body for success
								// Let's assume it returns JSON { success: true, result: '<html>...' } for consistency
								// But let's test first returning the whole body
								// property: '={{ $response.body }}', // Get the whole body
								// Let's assume it returns the HTML directly as text/html if successful
								// Or maybe JSON? Let's test the default first.
							},
						},
					},
					{
						name: 'Get Links',
						value: 'links',
						action: 'Extract links from a page',
						routing: {
							request: {
								url: '/links',
								body: {
									// 'send' moved into 'body'
									mode: 'raw',
									json: true,
									value: JSON.stringify({
										url: '={{ $parameter.url }}',
										visibleLinksOnly: '={{ $parameter.visibleLinksOnly }}',
									}),
								},
							},
						},
					},
					{
						name: 'Take Screenshot',
						value: 'screenshot',
						action: 'Capture a screenshot of a page or HTML',
						routing: {
							request: {
								url: '/screenshot',
								body: {
									// 'send' moved into 'body'
									mode: 'raw',
									json: true,
									value: JSON.stringify({
										url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
										html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
										// Embed screenshot options directly if they exist
										screenshotOptions: '={{ $parameter.screenshotOptions ?? {} }}',
									}),
								},
								// Expect binary data (image blob) as response
								encoding: 'blob',
							},
						},
					},
				],
				default: 'content',
			},

			// Input Source (URL or HTML) - Common for Content and Screenshot
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'HTML', value: 'html' },
				],
				default: 'url',
				description: 'Specify whether to render a URL or provided HTML content',
				displayOptions: {
					show: {
						operation: ['content', 'screenshot'],
					},
				},
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com',
				description: 'The URL of the page to process',
				// Show only when operation needs a URL (links) OR
				// when operation is content/screenshot AND source is URL
				displayOptions: {
					show: {
						'/operation': ['links'],
					},
					// Combining logic: Need to adjust based on how complex displayOptions can be.
					// Simplest might be to always show URL and make it required conditionally
					// Let's revert to simpler show logic for now and require=true
					/* Complex logic removed
					or: [
						{
							show: {
								'/operation': ['content', 'screenshot'],
								'/source': ['url']
							}
						}
					]
					*/
				},
				// We might need a custom execute function just to handle the conditional requirement logic
				// Or set required dynamically based on other params if possible.
				// For now, keeping required: true and relying on user input validation.
			},
			{
				displayName: 'HTML Content',
				name: 'htmlInput', // Renamed to avoid conflict with potential 'html' property in output
				type: 'string',
				default: '',
				required: true,
				typeOptions: {
					rows: 5, // Make text area larger
				},
				placeholder: '<html><body>Hello World!</body></html>',
				description: 'The HTML content to render',
				displayOptions: {
					show: {
						operation: ['content', 'screenshot'],
						source: ['html'],
					},
				},
			},

			// --- Options for Get Links ---
			{
				displayName: 'Visible Links Only',
				name: 'visibleLinksOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only links that are visible on the rendered page',
				displayOptions: {
					show: {
						operation: ['links'],
					},
				},
			},

			// --- Options for Take Screenshot ---
			{
				displayName: 'Screenshot Options',
				name: 'screenshotOptions',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false, // Only one set of options
					// Properties moved inside typeOptions
					properties: screenshotOptionsFields, // Use the defined fields
				},
				default: {}, // Default to empty object -> API defaults
				placeholder: 'Add Screenshot Option',
				description: 'Configure screenshot parameters like format, quality, etc',
				displayOptions: {
					show: {
						operation: ['screenshot'],
					},
				},
				// properties: screenshotOptionsFields, // Removed from here
			},

			// --- Options for Get Content (Example - Add later if needed) ---
			/*
			{
				displayName: 'Reject Resource Types',
				name: 'rejectResourceTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Image', value: 'image' },
					{ name: 'Stylesheet', value: 'stylesheet' },
					{ name: 'Script', value: 'script' },
					{ name: 'Font', value: 'font' },
					// Add other types if supported by API
				],
				default: [],
				description: 'Specify resource types to block during rendering',
				displayOptions: {
					show: {
						operation: ['content'],
					},
				},
			},
			{
				displayName: 'Reject Request Pattern (Regex)',
				name: 'rejectRequestPattern',
				type: 'string', // Should actually be string[], but multi-line string might be easier UI
				default: '',
				typeOptions: {
					rows: 2,
				},
				placeholder: '^.*\\.(css|png)',
				description: 'A regex pattern (or multiple patterns, one per line) for URLs to block.',
				displayOptions: {
					show: {
						operation: ['content'],
					},
				},
				// Note: This would require processing in execute or a helper if API needs string[]
			},
			*/
		],
	};

	// No execute method needed in declarative style!
}

// Helper function if needed for complex transformations (not used in this basic version)
// async function processScreenshotResponse(this: IExecuteFunctions, response: IDataObject): Promise<INodeExecutionData[]> {
// 	const binaryData = this.helpers.getBinaryDataBuffer(0); // Assuming binary data is at index 0
//  const options = this.getNodeParameter('screenshotOptions', 0, {}) as IDataObject;
//  const format = options.type || 'png';
//  const returnItem: INodeExecutionData = {
// 		json: {}, // Add any JSON data if needed
// 		binary: {
// 			data: binaryData
// 		},
//    mimeType: `image/${format}`, // Set correct MIME type
//    fileName: `screenshot.${format}` // Set filename
// 	};
// 	return [returnItem];
// }
