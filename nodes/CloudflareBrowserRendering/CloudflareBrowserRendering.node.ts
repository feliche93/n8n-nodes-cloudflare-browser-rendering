import type {
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	// JsonObject, // Removed unused import
} from 'n8n-workflow';
// import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'; // Removed unused NodeConnectionType
// import { NodeOperationError } from 'n8n-workflow'; // Removed unused NodeOperationError

// --- Reusable Property Definitions ---

const sharedUrlProperty: INodeProperties = {
	displayName: 'URL',
	name: 'url',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'https://example.com',
	description: 'The full URL (including http:// or https://) of the page to process',
	hint: 'Enter the complete URL, e.g., https://n8n.io',
};

const sharedHtmlProperty: INodeProperties = {
	displayName: 'HTML Content',
	name: 'htmlInput', // Renamed to avoid conflict
	type: 'string',
	default: '',
	required: true,
	typeOptions: {
		editor: 'htmlEditor',
		rows: 10,
	},
	placeholder: '<html><body>Hello World!</body></html>',
	description: 'The HTML content to render, including CSS in <style> tags if needed',
};

const sharedSourceProperty: INodeProperties = {
	displayName: 'Source',
	name: 'source',
	type: 'options',
	options: [
		{ name: 'URL', value: 'url' },
		{ name: 'HTML', value: 'html' },
	],
	default: 'url',
	description: 'Specify whether to render a URL or provided HTML content',
};

const rejectResourceTypesProperty: INodeProperties = {
	displayName: 'Reject Resource Types',
	name: 'rejectResourceTypes',
	type: 'multiOptions',
	options: [
		{ name: 'Image', value: 'image' },
		{ name: 'Stylesheet', value: 'stylesheet' },
		{ name: 'Script', value: 'script' },
		{ name: 'Font', value: 'font' },
		{ name: 'Media', value: 'media' },
		{ name: 'WebSocket', value: 'websocket' },
		{ name: 'Other', value: 'other' },
	],
	default: [],
	description: 'Specify resource types to block during rendering (e.g., images, scripts).',
};

const rejectRequestPatternProperty: INodeProperties = {
	displayName: 'Reject Request Pattern',
	name: 'rejectRequestPattern',
	type: 'string',
	typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Pattern' },
	default: [],
	placeholder: '/^.*\\\\.(css|js)$/',
	description: 'Block requests matching these regex patterns (one pattern per entry).',
};

const viewportProperty: INodeProperties = {
	displayName: 'Viewport',
	name: 'viewport',
	type: 'fixedCollection',
	default: {},
	description: 'Set the browser viewport size.',
	placeholder: 'Add Viewport Size',
	typeOptions: {
		multipleValues: false,
		properties: [
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				typeOptions: { numberStepSize: 10, minValue: 1 },
				default: 1280,
				description: 'Viewport width in pixels.',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				typeOptions: { numberStepSize: 10, minValue: 1 },
				default: 720,
				description: 'Viewport height in pixels.',
			},
			{
				displayName: 'Device Scale Factor',
				name: 'deviceScaleFactor',
				type: 'number',
				typeOptions: { numberStepSize: 0.1, minValue: 1 },
				default: 1,
				description: 'Specify device scale factor (e.g., 2 for Retina displays).',
			},
		],
	},
};

const gotoOptionsProperty: INodeProperties = {
	displayName: 'Navigation Options (Simplified)',
	name: 'gotoOptions',
	type: 'fixedCollection',
	default: {},
	description: 'Control page navigation behavior (subset of Puppeteer options).',
	placeholder: 'Add Navigation Option',
	typeOptions: {
		multipleValues: false,
		properties: [
			{
				displayName: 'Wait Until',
				name: 'waitUntil',
				type: 'options',
				options: [
					{ name: 'load', value: 'load', description: 'Wait for the load event' },
					{ name: 'DOMContentLoaded', value: 'domcontentloaded', description: 'Wait for DOMContentLoaded event' },
					{ name: 'Network Idle 0', value: 'networkidle0', description: 'No network connections for 500ms' },
					{ name: 'Network Idle 2', value: 'networkidle2', description: 'No more than 2 network connections for 500ms' },
				],
				default: 'load',
				description: 'When to consider navigation successful.',
			},
		],
	},
};

const addScriptTagProperty: INodeProperties = {
	displayName: 'Add Script Tag',
	name: 'addScriptTag',
	type: 'fixedCollection',
	default: [{}],
	description: 'Inject custom JavaScript into the page.',
	placeholder: 'Add Script',
	typeOptions: {
		multipleValues: true,
		sortable: true,
		properties: [
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'Content', value: 'content' },
					{ name: 'URL', value: 'url' },
					{ name: 'Path', value: 'path' }, // Path might not be directly supported, use URL?
				],
				default: 'content',
				noDataExpression: true,
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 3, editor: 'javascriptEditor' },
				default: '',
				displayOptions: { show: { '/source': ['content'] } },
				description: 'Inline JavaScript code.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				displayOptions: { show: { '/source': ['url'] } },
				description: 'URL of the script to inject.',
			},
			// 'path' omitted as API likely expects URL or content
		],
	},
};

const addStyleTagProperty: INodeProperties = {
	displayName: 'Add Style Tag',
	name: 'addStyleTag',
	type: 'fixedCollection',
	default: [{}],
	description: 'Inject custom CSS styles into the page.',
	placeholder: 'Add Style',
	typeOptions: {
		multipleValues: true,
		sortable: true,
		properties: [
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'Content', value: 'content' },
					{ name: 'URL', value: 'url' },
					{ name: 'Path', value: 'path' }, // Path might not be directly supported, use URL?
				],
				default: 'content',
				noDataExpression: true,
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 3, editor: 'cssEditor' },
				default: '',
				displayOptions: { show: { '/source': ['content'] } },
				description: 'Inline CSS styles.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				displayOptions: { show: { '/source': ['url'] } },
				description: 'URL of the stylesheet to inject.',
			},
			// 'path' omitted as API likely expects URL or content
		],
	},
};

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
	// Add other screenshot options like clip if needed
];

// --- Main Node Definition ---

export class CloudflareBrowserRendering implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cloudflare Browser Rendering',
		name: 'cloudflareBrowserRendering',
		icon: 'file:cloudflareBrowserRendering.svg',
		group: ['utility'],
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

		requestDefaults: {
			baseURL:
				'={{ `https://api.cloudflare.com/client/v4/accounts/${$credentials.accountId}/browser-rendering` }}',
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		},

		properties: [
			// Operation Selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Content',
						value: 'content',
						action: 'Get rendered HTML content',
						routing: {
							request: {
								url: '/content',
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern }}',
									viewport: '={{ $parameter.viewport }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
									addScriptTag: '={{ $parameter.addScriptTag }}',
									addStyleTag: '={{ $parameter.addStyleTag }}',
								},
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
									url: '={{ $parameter.url }}',
									visibleLinksOnly: '={{ $parameter.visibleLinksOnly }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
								},
							},
						},
					},
					{
						name: 'Get Markdown',
						value: 'markdown',
						action: 'Convert a page to Markdown content',
						routing: {
							request: {
								url: '/markdown',
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
								},
							},
						},
					},
					{
						name: 'Get PDF',
						value: 'pdf',
						action: 'Generate a PDF document from a page or HTML',
						routing: {
							request: {
								url: '/pdf',
								encoding: 'blob', // Expect binary PDF data
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									addStyleTag: '={{ $parameter.addStyleTag }}',
									setExtraHTTPHeaders: '={{ $parameter.setExtraHTTPHeaders }}', // Add property later
									viewport: '={{ $parameter.viewport }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern }}',
									// pdfOptions: {}, // Add later if needed
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
								encoding: 'blob', // Expect binary image data
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									screenshotOptions: '={{ $parameter.screenshotOptions }}',
									viewport: '={{ $parameter.viewport }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
									addScriptTag: '={{ $parameter.addScriptTag }}',
									addStyleTag: '={{ $parameter.addStyleTag }}',
								},
							},
						},
					},
					{
						name: 'Get Snapshot',
						value: 'snapshot',
						action: 'Get HTML content and Base64 screenshot',
						routing: {
							request: {
								url: '/snapshot',
								// Response is JSON containing HTML string + Base64 image string
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									addScriptTag: '={{ $parameter.addScriptTag }}',
									// setJavaScriptEnabled: '={{ $parameter.setJavaScriptEnabled }}', // Add later
									screenshotOptions: '={{ $parameter.screenshotOptions }}',
									viewport: '={{ $parameter.viewport }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
								},
							},
						},
					},
					{
						name: 'Scrape Elements',
						value: 'scrape',
						action: 'Extract structured data using CSS selectors',
						routing: {
							request: {
								url: '/scrape',
								body: {
									url: '={{ $parameter.url }}',
									elements: '={{ $parameter.elements }}',
									gotoOptions: '={{ $parameter.gotoOptions }}',
								},
							},
						},
					},
					{
						name: 'Extract JSON (AI)',
						value: 'json',
						action: 'Extract structured JSON data using AI',
						routing: {
							request: {
								url: '/json',
								body: {
									url: '={{ $parameter.url }}',
									prompt: '={{ $parameter.prompt }}',
									response_format: '={{ $parameter.responseFormatSchema ? JSON.parse($parameter.responseFormatSchema) : undefined }}', // Parse JSON string
								},
							},
						},
					},
				],
				default: 'content',
			},

			// --- Input Source (URL / HTML) ---
			{ ...sharedSourceProperty, displayOptions: { show: { operation: ['content', 'screenshot', 'pdf', 'snapshot', 'markdown'] } } },
			{ ...sharedUrlProperty, displayOptions: { show: { // Show if URL needed OR Source=URL
				operation: ['content', 'screenshot', 'pdf', 'snapshot', 'links', 'scrape', 'json', 'markdown']
			}}},
			{ ...sharedHtmlProperty, displayOptions: { show: { // Show only if Source=HTML
				'/operation': ['content', 'screenshot', 'pdf', 'snapshot', 'markdown'],
				'/source': ['html']
			}}},

			// --- Operation Specific Options ---

			// Links
			{
				displayName: 'Visible Links Only',
				name: 'visibleLinksOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only links currently visible in the viewport, excluding those hidden or off-screen',
				displayOptions: { show: { operation: ['links'] } },
			},

			// Screenshot / Snapshot
			{
				displayName: 'Screenshot Options',
				name: 'screenshotOptions',
				type: 'fixedCollection',
				description: 'Configure screenshot parameters like format, quality, etc.',
				placeholder: 'Add Screenshot Option',
				displayOptions: { show: { operation: ['screenshot', 'snapshot'] } },
				default: {},
				typeOptions: { multipleValues: false, properties: screenshotOptionsFields },
			},

			// Scrape
			{
				displayName: 'Elements to Scrape',
				name: 'elements',
				type: 'fixedCollection',
				default: [{selector:''}],
				description: 'Define CSS selectors for elements to extract.',
				placeholder: 'Add Selector',
				displayOptions: { show: { operation: ['scrape'] } },
				typeOptions: {
					multipleValues: true,
					sortable: true,
					properties: [
						{
							displayName: 'CSS Selector',
							name: 'selector',
							type: 'string',
							default: '',
							required: true,
							placeholder: 'e.g., h1, div.product-title, a[href]',
							description: 'The CSS selector to match elements.',
						},
					],
				},
			},

			// JSON (AI)
			{
				displayName: 'Notice: Workers AI Usage',
				name: 'jsonNotice',
				type: 'notice',
				displayOptions: { show: { operation: ['json'] } },
				default: 'Using this operation incurs costs on Cloudflare Workers AI. Monitor usage in your Cloudflare dashboard.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Optional: Guide the AI on what data to extract (e.g., "Get me the list of AI products").',
				displayOptions: { show: { operation: ['json'] } },
			},
			{
				displayName: 'Response Format (JSON Schema)',
				name: 'responseFormatSchema',
				type: 'string',
				typeOptions: { rows: 10, editor: 'jsEditor' },
				default: '',
				description: 'Optional: Define the expected JSON structure for the output using a JSON schema.',
				placeholder: '{\n  "type": "object",\n  "properties": {\n    "products": {\n      "type": "array",\n      "items": { ... }\n    }\n  }\n}',
				displayOptions: { show: { operation: ['json'] } },
			},

			// --- Advanced Options (Common) ---
			{ ...viewportProperty, displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } } },
			{ ...gotoOptionsProperty, displayOptions: { show: { operation: ['content', 'screenshot', 'pdf', 'snapshot', 'links', 'scrape', 'markdown'] } } }, // Applicable to most URL-based ops
			{ ...rejectResourceTypesProperty, displayOptions: { show: { operation: ['content', 'pdf'] } } },
			{ ...rejectRequestPatternProperty, displayOptions: { show: { operation: ['content', 'pdf', 'markdown'] } } },
			{ ...addStyleTagProperty, displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } } },
			{ ...addScriptTagProperty, displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } } },

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
