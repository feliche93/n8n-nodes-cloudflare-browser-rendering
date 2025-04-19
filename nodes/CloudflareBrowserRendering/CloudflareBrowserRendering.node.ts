// import { Buffer } from 'buffer'; // <-- Remove Buffer import
import type {
	IExecuteFunctions,
	INodeExecutionData,
	// INodeProperties, // <-- Remove unused import
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
	// IBinaryData, // <-- Remove unused import
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow'; // Value import

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
					},
					{
						name: 'Get Links',
						value: 'links',
						action: 'Extract links from a page',
					},
					{
						name: 'Get Markdown',
						value: 'markdown',
						action: 'Convert a page to Markdown content',
					},
					{
						name: 'Get PDF',
						value: 'pdf',
						action: 'Generate a PDF document from a page or HTML',
					},
					{
						name: 'Take Screenshot',
						value: 'screenshot',
						action: 'Capture a screenshot of a page or HTML',
					},
					{
						name: 'Get Snapshot',
						value: 'snapshot',
						action: 'Get HTML content and Base64 screenshot',
					},
					{
						name: 'Scrape Elements',
						value: 'scrape',
						action: 'Extract structured data using CSS selectors',
					},
					{
						name: 'Extract JSON (AI)',
						value: 'json',
						action: 'Extract structured JSON data using AI',
					},
				],
				default: 'content',
			},

			// --- Define Source Inline ---
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
				displayOptions: { show: { operation: ['content', 'screenshot', 'pdf', 'snapshot', 'markdown'] } },
			},
			// --- Define URL Inline ---
			{
	displayName: 'URL',
	name: 'url',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'https://example.com',
	description: 'The full URL (including http:// or https://) of the page to process',
	hint: 'Enter the complete URL, e.g., https://n8n.io',
				displayOptions: { show: { // Show if URL needed OR Source=URL
				operation: ['content', 'screenshot', 'pdf', 'snapshot', 'links', 'scrape', 'json', 'markdown']
				}},
			},
			// --- Define HTML Inline ---
			{
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
				displayOptions: { show: { // Show only if Source=HTML
				'/operation': ['content', 'screenshot', 'pdf', 'snapshot', 'markdown'],
				'/source': ['html']
				}},
			},

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
	typeOptions: {
		multipleValues: false,
				},
				options: [
					{
						name: 'screenshotItem',
						displayName: 'Options',
						values: [
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
						],
						description: 'An object defining the rectangular area of the page to clip the screenshot to.',
					},
				],
			},

			// Scrape
			{
				displayName: 'Elements to Scrape',
				name: 'elements',
				type: 'fixedCollection',
				default: [],
				description: 'Define CSS selectors for elements to extract.',
				placeholder: 'Add Selector',
				displayOptions: { show: { operation: ['scrape'] } },
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				options: [
					{
						name: 'elementItem',
						displayName: 'Selector Item',
						values: [
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
				],
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

			// --- Advanced Options (Common) - Define Inline ---
			// --- Viewport (Already Inline, now apply options/values) ---
			{
				displayName: 'Viewport',
				name: 'viewport',
				type: 'fixedCollection',
				default: {},
				description: 'Set the browser viewport size.',
				placeholder: 'Add Viewport Size',
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'viewportItem',
						displayName: 'Size',
						values: [
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
				],
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			// --- gotoOptions (Inline, now apply options/values) ---
			{
				displayName: 'Navigation Options (Simplified)',
				name: 'gotoOptions',
				type: 'fixedCollection',
				default: {},
				description: 'Control page navigation behavior (subset of Puppeteer options).',
				placeholder: 'Add Navigation Option',
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'navigationItem',
						displayName: 'Navigation',
						values: [
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
							{
								displayName: 'Timeout (ms)',
								name: 'timeout',
								type: 'number',
								typeOptions: { minValue: 0 },
								default: 30000, // Default to 30 seconds
								description: 'Maximum navigation time in milliseconds. Set to 0 to disable timeout. Defaults to 30 seconds.',
							},
						],
					},
				],
				displayOptions: { show: { operation: ['content', 'screenshot', 'pdf', 'snapshot', 'links', 'scrape', 'markdown'] } },
			},
			// --- rejectResourceTypes (Inline) ---
			{
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
				displayOptions: { show: { operation: ['content', 'pdf'] } },
			},
			// --- rejectRequestPattern (Inline) ---
			{
				displayName: 'Reject Request Pattern',
				name: 'rejectRequestPattern',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Pattern' },
				default: [],
				placeholder: '/^.*\\.(css|js)$/',
				description: 'Block requests matching these regex patterns (one pattern per entry).',
				displayOptions: { show: { operation: ['content', 'pdf', 'markdown'] } },
			},
			// --- addStyleTag (Inline) ---
			{
				displayName: 'Add Style Tag',
				name: 'addStyleTag',
				type: 'fixedCollection',
				default: [],
				description: 'Inject custom CSS styles into the page.',
				placeholder: 'Add Style',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				options: [
					{
						name: 'styleItem',
						displayName: 'Style Item',
						values: [
							{
								displayName: 'Source',
								name: 'source',
								type: 'options',
								options: [
									{ name: 'Content', value: 'content' },
									{ name: 'URL', value: 'url' },
									{ name: 'Path', value: 'path' },
								],
								default: 'content',
								noDataExpression: true,
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: { rows: 3 },
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
						],
					},
				],
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			// --- addScriptTag (Inline, now apply options/values) ---
			{
				displayName: 'Add Script Tag',
				name: 'addScriptTag',
				type: 'fixedCollection',
				default: [],
				description: 'Inject custom JavaScript into the page.',
				placeholder: 'Add Script',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				options: [
					{
						name: 'scriptItem',
						displayName: 'Script Item',
						values: [
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
								typeOptions: { rows: 3 },
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
						],
					},
				],
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			// --- setExtraHTTPHeaders (Inline) ---
			{
				displayName: 'Set Extra HTTP Headers',
				name: 'setExtraHTTPHeaders',
				type: 'json', // <-- Changed to json
				default: '{}', // Default to an empty JSON object string
				description: 'Set extra HTTP headers as a JSON object (e.g., { "X-Custom": "Value" }).',
				placeholder: '{\n  "X-Custom-Header": "Value",\n  "Authorization": "Bearer ..."\n}',
				typeOptions: {
					rows: 3, // Provide a few rows for the JSON editor
				},
				displayOptions: { show: { operation: ['pdf'] } },
			},
			// --- Add Binary Property Name Field ---
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to write the file data to.',
				displayOptions: {
					show: {
						operation: ['pdf', 'screenshot'],
					},
				},
			},
			// --- waitForTimeout - TODO: Define this if needed
			// --- scrollPage - Add definition
			{
				displayName: 'Scroll Page',
				name: 'scrollPage',
				type: 'boolean',
				default: false,
				description: 'Whether to scroll the page to the bottom before capturing. Useful for lazy-loading content.',
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			// --- bestAttempt - TODO: Define this if needed
			{
				displayName: 'Set JavaScript Enabled',
				name: 'setJavaScriptEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether to enable JavaScript in the rendered page.',
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},

			// --- Add missing parameter definitions ---
			{
				displayName: 'Wait For Timeout (ms)',
				name: 'waitForTimeout',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 60000 },
				default: 0,
				description: 'Waits for a specified timeout in milliseconds before continuing (0 to disable). Max 60000.',
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			{
				displayName: 'Best Attempt',
				name: 'bestAttempt',
				type: 'boolean',
				default: false,
				description: 'Whether to attempt to proceed when awaited events fail or timeout.',
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot'] } },
			},
			{
				displayName: 'Emulate Media Type',
				name: 'emulateMediaType',
				type: 'options',
				options: [
					{ name: 'Default (Unset)', value: '' },
					{ name: 'Screen', value: 'screen' },
					{ name: 'Print', value: 'print' },
				],
				default: '',
				description: 'Changes the CSS media type of the page.',
				displayOptions: { show: { operation: ['screenshot', 'pdf'] } },
			},
			{
				displayName: 'Allow Resource Types',
				name: 'allowResourceTypes',
				type: 'multiOptions',
				options: [
					// Copied from Puppeteer resource types - need verification if CF supports all
					{ name: 'Document', value: 'document' },
					{ name: 'Stylesheet', value: 'stylesheet' },
					{ name: 'Image', value: 'image' },
					{ name: 'Media', value: 'media' },
					{ name: 'Font', value: 'font' },
					{ name: 'Script', value: 'script' },
					{ name: 'TextTrack', value: 'texttrack' },
					{ name: 'XHR', value: 'xhr' },
					{ name: 'Fetch', value: 'fetch' },
					{ name: 'Prefetch', value: 'prefetch' },
					{ name: 'EventSource', value: 'eventsource' },
					{ name: 'WebSocket', value: 'websocket' },
					{ name: 'Manifest', value: 'manifest' },
					{ name: 'SignedExchange', value: 'signedexchange' },
					{ name: 'Ping', value: 'ping' },
					{ name: 'CSP Violation Report', value: 'cspviolationreport' },
					{ name: 'Preflight', value: 'preflight' },
					{ name: 'Other', value: 'other' },
				],
				default: [],
				description: 'Only allow requests for these resource types (overrides Reject Resource Types).',
				displayOptions: { show: { operation: ['screenshot', 'pdf'] } },
			},
			{
				displayName: 'Allow Request Pattern',
				name: 'allowRequestPattern',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Pattern' },
				default: [],
				placeholder: '/^https:\/\/cdnjs\.cloudflare\.com\//',
				description: 'Only allow requests matching these regex patterns (overrides Reject Request Pattern).',
				displayOptions: { show: { operation: ['screenshot', 'pdf'] } },
			},
			{
				displayName: 'User Agent',
				name: 'userAgent',
				type: 'string',
				default: '', // Empty means use CF default
				placeholder: 'Mozilla/5.0 (...',
				description: 'Override the browser user agent string. Leave empty to use Cloudflare default.',
				displayOptions: { show: { operation: ['screenshot', 'pdf', 'snapshot', 'content', 'links', 'scrape', 'markdown'] } },
			},
		],
	};

	// --- Programmatic Execute Method ---
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Loop through each item received
		for (let i = 0; i < items.length; i++) {
			// Note: Removed the outer try...catch block inside the loop.
			// Errors will now propagate up to the n8n core execution handler,
			// which respects the 'continueOnFail' setting.

			const operation = this.getNodeParameter('operation', i) as string;
			const credentials = await this.getCredentials('cloudflareApi', i);
			const baseURL = `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/browser-rendering`;
			const headers = { Authorization: `Bearer ${credentials.apiToken}` };

			let endpoint = '';
			const body: IDataObject = {};
			let encoding: IHttpRequestOptions['encoding'] = undefined; // Default encoding
			let needsUrl = false;
			let needsHtml = false;

			// Determine endpoint and basic input requirements
			switch (operation) {
				case 'content':
					endpoint = '/content';
					needsUrl = this.getNodeParameter('source', i) === 'url';
					needsHtml = this.getNodeParameter('source', i) === 'html';
					break;
				case 'links':
					endpoint = '/links';
					needsUrl = true;
					break;
				case 'markdown':
					endpoint = '/markdown';
					needsUrl = this.getNodeParameter('source', i) === 'url';
					needsHtml = this.getNodeParameter('source', i) === 'html';
					break;
				case 'pdf':
					endpoint = '/pdf';
					encoding = 'arraybuffer';
					needsUrl = this.getNodeParameter('source', i) === 'url';
					needsHtml = this.getNodeParameter('source', i) === 'html';
					break;
				case 'screenshot':
					endpoint = '/screenshot';
					encoding = 'arraybuffer';
					needsUrl = this.getNodeParameter('source', i) === 'url';
					needsHtml = this.getNodeParameter('source', i) === 'html';
					break;
				case 'snapshot':
					endpoint = '/snapshot';
					needsUrl = this.getNodeParameter('source', i) === 'url';
					needsHtml = this.getNodeParameter('source', i) === 'html';
					break;
				case 'scrape':
					endpoint = '/scrape';
					needsUrl = true;
					break;
				case 'json':
					endpoint = '/json';
					needsUrl = true;
					break;
				default:
					// If operation is invalid, throw an error. n8n core will catch it.
					// We need this.getNode() here, but it should be safe outside the catch block.
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, { itemIndex: i });
			}

			// Populate basic source
			if (needsUrl) {
				body.url = this.getNodeParameter('url', i) as string;
			}
			if (needsHtml) {
				body.html = this.getNodeParameter('htmlInput', i) as string;
			}

			// Add operation-specific parameters
			if (operation === 'links') {
				body.visibleLinksOnly = this.getNodeParameter('visibleLinksOnly', i) as boolean;
			}
			if (operation === 'scrape') {
				const elementsParam = this.getNodeParameter('elements', i, []) as any[];
				if (elementsParam.length > 0) {
					body.elements = elementsParam.map(item => item.elementItem);
				}
			}
			if (operation === 'json') {
				const prompt = this.getNodeParameter('prompt', i, '') as string;
				if (prompt) body.prompt = prompt;
				const schema = this.getNodeParameter('responseFormatSchema', i, '') as string;
				if (schema) {
					// Parse JSON here. If it fails, the error will propagate.
					body.response_format = JSON.parse(schema);
				}
			}

			// Add common advanced parameters where applicable
			if ([ 'content', 'pdf', 'screenshot', 'snapshot', 'links', 'scrape', 'markdown'].includes(operation)) {
				const gotoOptionsParam = this.getNodeParameter('gotoOptions', i, []) as any[];
				if (gotoOptionsParam.length > 0 && gotoOptionsParam[0].navigationItem) {
					body.gotoOptions = gotoOptionsParam[0].navigationItem;
				}
			}
			if ([ 'content', 'pdf', 'screenshot', 'snapshot'].includes(operation)) {
				const viewportParam = this.getNodeParameter('viewport', i, []) as any[];
				if (viewportParam.length > 0 && viewportParam[0].viewportItem) {
					body.viewport = viewportParam[0].viewportItem;
				}
			}
			if ([ 'screenshot', 'pdf', 'snapshot'].includes(operation)) {
				const addStyleTagParam = this.getNodeParameter('addStyleTag', i, []) as any[];
				if (addStyleTagParam.length > 0) {
					body.addStyleTag = addStyleTagParam.map(item => item.styleItem);
				}
				const addScriptTagParam = this.getNodeParameter('addScriptTag', i, []) as any[];
				if (addScriptTagParam.length > 0) {
					body.addScriptTag = addScriptTagParam.map(item => item.scriptItem);
				}
				const waitForTimeout = this.getNodeParameter('waitForTimeout', i, 0) as number;
				if (waitForTimeout > 0) body.waitForTimeout = waitForTimeout;

				// Fetch scrollPage parameter and assign to body
				const scrollPageValue = this.getNodeParameter('scrollPage', i, false) as boolean; // Fetch value (with default)
				body.scrollPage = scrollPageValue; // Assign fetched value to body

				// Fetch bestAttempt parameter and assign to body
				const bestAttemptValue = this.getNodeParameter('bestAttempt', i, false) as boolean; // Fetch value (with default)
				body.bestAttempt = bestAttemptValue; // Assign fetched value to body

				// Fetch setJavaScriptEnabled parameter and assign to body
				const setJavaScriptEnabledValue = this.getNodeParameter('setJavaScriptEnabled', i, true) as boolean; // Fetch value (with default)
				body.setJavaScriptEnabled = setJavaScriptEnabledValue; // Assign fetched value to body
			}
			if ([ 'content', 'pdf', 'markdown'].includes(operation)) {
				const rejectRequestPatternParam = this.getNodeParameter('rejectRequestPattern', i, []) as string[];
				if (rejectRequestPatternParam.length > 0) {
					body.rejectRequestPattern = rejectRequestPatternParam;
				}
			}
			if ([ 'content', 'pdf'].includes(operation)) {
				const rejectResourceTypesParam = this.getNodeParameter('rejectResourceTypes', i, []) as string[];
				if (rejectResourceTypesParam.length > 0) {
					body.rejectResourceTypes = rejectResourceTypesParam;
				}
			}
			if ([ 'screenshot', 'pdf'].includes(operation)) {
				const allowResourceTypesParam = this.getNodeParameter('allowResourceTypes', i, []) as string[];
				if (allowResourceTypesParam.length > 0) {
					body.allowResourceTypes = allowResourceTypesParam;
				}
				const allowRequestPatternParam = this.getNodeParameter('allowRequestPattern', i, []) as string[];
				if (allowRequestPatternParam.length > 0) {
					body.allowRequestPattern = allowRequestPatternParam;
				}
				const setExtraHTTPHeadersRaw = this.getNodeParameter('setExtraHTTPHeaders', i, '{}') as string;
				// Parse JSON here. If it fails, the error will propagate.
				const setExtraHTTPHeaders = JSON.parse(setExtraHTTPHeadersRaw);
				if (Object.keys(setExtraHTTPHeaders).length > 0) {
					body.setExtraHTTPHeaders = setExtraHTTPHeaders;
				}
				const emulateMediaType = this.getNodeParameter('emulateMediaType', i, '') as string;
				if (emulateMediaType) body.emulateMediaType = emulateMediaType;
			}
			if ([ 'screenshot', 'snapshot'].includes(operation)) {
				const screenshotOptionsParam = this.getNodeParameter('screenshotOptions', i, []) as any[];
				if (screenshotOptionsParam.length > 0 && screenshotOptionsParam[0].screenshotItem) {
					const opts = { ...screenshotOptionsParam[0].screenshotItem };
					const clipParam = opts.clip; // Handle nested clip
					if (clipParam && clipParam.length > 0 && clipParam[0].clipItem) {
						opts.clip = clipParam[0].clipItem;
					} else {
						delete opts.clip; // Remove if empty
					}
					body.screenshotOptions = opts;
				}
				if (body.setJavaScriptEnabled) {
					body.setJavaScriptEnabled = this.getNodeParameter('setJavaScriptEnabled', i) as boolean;
				}
			}
			if (operation === 'screenshot') {
				const selector = this.getNodeParameter('selector', i, '') as string;
				if (selector) body.selector = selector;
			}
			if ([ 'screenshot', 'pdf', 'snapshot', 'content', 'links', 'scrape', 'markdown'].includes(operation)) {
				const userAgent = this.getNodeParameter('userAgent', i, '') as string;
				if (userAgent) body.userAgent = userAgent;
			}

			// Prepare HTTP Request options
			const options: IHttpRequestOptions = {
				url: baseURL + endpoint,
				headers,
				method: 'POST',
				body,
				encoding, // Set to 'blob' for binary types
				returnFullResponse: false,
				// Conditionally set json: true ONLY if not expecting binary data
				...(encoding ? {} : { json: true }),
			};
			// Explicitly set Content-Type for non-binary JSON requests
			if (!encoding) {
				options.headers = { ...options.headers, 'Content-Type': 'application/json' };
			}

			// Make the API call. Errors will propagate up.
			// Cast helpers to 'any' to bypass the strict 'this' context type check.
			let responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'cloudflareApi', options);

			// Process the successful response
			let executionData: INodeExecutionData;
			if (operation === 'pdf' || operation === 'screenshot') {
				// Wrap binary processing in try...catch for diagnostics
				try {
					let mimeType = 'application/octet-stream';
					let fileName = 'output';

					if (operation === 'pdf') {
						mimeType = 'application/pdf';
						fileName = 'output.pdf';
					} else {
						const screenshotOptionsParam = this.getNodeParameter('screenshotOptions', i, []) as any[];
						const format = (screenshotOptionsParam.length > 0 && screenshotOptionsParam[0].screenshotItem && screenshotOptionsParam[0].screenshotItem.type)
							? screenshotOptionsParam[0].screenshotItem.type
							: 'png';
						mimeType = `image/${format}`;
						fileName = `screenshot.${format}`;
					}

					const binaryData = await this.helpers.prepareBinaryData(responseData as any, fileName, mimeType);
					executionData = {
						json: {},
						binary: { [this.getNodeParameter('binaryPropertyName', i, 'data') as string]: binaryData },
					};
				} catch (binaryError) {
					const responseDataType = typeof responseData;
					const responseDataKeys = (responseData && typeof responseData === 'object') ? Object.keys(responseData) : 'N/A';
					const errorMessage = `Error processing binary data: ${binaryError.message}. ResponseData type: ${responseDataType}, Keys: ${JSON.stringify(responseDataKeys)}`;

					if (this.continueOnFail()) {
						executionData = {
							json: { error: errorMessage },
							error: new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i, description: 'Error occurred during prepareBinaryData call.' })
						};
					} else {
						// Throw a new error with the diagnostic info
						throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i, description: 'Error occurred during prepareBinaryData call.' });
					}
				}
			} else {
				// Handle JSON responses
				if (typeof responseData === 'string') {
					// Parse JSON here. If it fails, the error will propagate.
					responseData = JSON.parse(responseData);
				}
				executionData = { json: responseData as IDataObject };
			}

			returnData.push(executionData);
		}

		// Return the processed data for all items
		// Using returnJsonArray helper as shown in tutorial, though [returnData] should also work.
		return [returnData];
	}
}
