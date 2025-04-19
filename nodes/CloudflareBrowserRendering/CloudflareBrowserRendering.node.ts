import type {
	INodeType,
	INodeTypeDescription,
	// JsonObject, // Removed unused import
} from 'n8n-workflow';
// import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'; // Removed unused NodeConnectionType
// import { NodeOperationError } from 'n8n-workflow'; // Removed unused NodeOperationError

// --- Reusable Property Definitions --- (Removed - Will define inline) ---
/*
const sharedUrlProperty: INodeProperties = { ... };
const sharedHtmlProperty: INodeProperties = { ... };
const sharedSourceProperty: INodeProperties = { ... };
const rejectResourceTypesProperty: INodeProperties = { ... };
const rejectRequestPatternProperty: INodeProperties = { ... };
const gotoOptionsProperty: INodeProperties = { ... };
const addScriptTagProperty: INodeProperties = { ... };
const addStyleTagProperty: INodeProperties = { ... };
const setExtraHTTPHeadersProperty: INodeProperties = { ... };
const screenshotOptionsFields: INodeProperties[] = [ ... ];
*/

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
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes && $parameter.rejectResourceTypes.length > 0 ? $parameter.rejectResourceTypes : undefined }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern && $parameter.rejectRequestPattern.length > 0 ? $parameter.rejectRequestPattern : undefined }}',
									allowResourceTypes: '={{ $parameter.allowResourceTypes && $parameter.allowResourceTypes.length > 0 ? $parameter.allowResourceTypes : undefined }}',
									allowRequestPattern: '={{ $parameter.allowRequestPattern && $parameter.allowRequestPattern.length > 0 ? $parameter.allowRequestPattern : undefined }}',
									viewport: '={{ $parameter.viewport && $parameter.viewport.length > 0 && $parameter.viewport[0].viewportItem ? $parameter.viewport[0].viewportItem : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
									addScriptTag: '={{ $parameter.addScriptTag && $parameter.addScriptTag.length > 0 ? $parameter.addScriptTag.map(item => item.scriptItem) : undefined }}',
									addStyleTag: '={{ $parameter.addStyleTag && $parameter.addStyleTag.length > 0 ? $parameter.addStyleTag.map(item => item.styleItem) : undefined }}',
									setExtraHTTPHeaders: '={{ $parameter.setExtraHTTPHeaders && Object.keys(JSON.parse($parameter.setExtraHTTPHeaders)).length > 0 ? JSON.parse($parameter.setExtraHTTPHeaders) : undefined }}',
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
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
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
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern && $parameter.rejectRequestPattern.length > 0 ? $parameter.rejectRequestPattern : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
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
									addStyleTag: '={{ $parameter.addStyleTag && $parameter.addStyleTag.length > 0 ? $parameter.addStyleTag.map(item => item.styleItem) : undefined }}',
									addScriptTag: '={{ $parameter.addScriptTag && $parameter.addScriptTag.length > 0 ? $parameter.addScriptTag.map(item => item.scriptItem) : undefined }}',
									setExtraHTTPHeaders: '={{ $parameter.setExtraHTTPHeaders && Object.keys(JSON.parse($parameter.setExtraHTTPHeaders)).length > 0 ? JSON.parse($parameter.setExtraHTTPHeaders) : undefined }}',
									viewport: '={{ $parameter.viewport && $parameter.viewport.length > 0 && $parameter.viewport[0].viewportItem ? $parameter.viewport[0].viewportItem : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes && $parameter.rejectResourceTypes.length > 0 ? $parameter.rejectResourceTypes : undefined }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern && $parameter.rejectRequestPattern.length > 0 ? $parameter.rejectRequestPattern : undefined }}',
									allowResourceTypes: '={{ $parameter.allowResourceTypes && $parameter.allowResourceTypes.length > 0 ? $parameter.allowResourceTypes : undefined }}',
									allowRequestPattern: '={{ $parameter.allowRequestPattern && $parameter.allowRequestPattern.length > 0 ? $parameter.allowRequestPattern : undefined }}',
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
								encoding: 'arraybuffer',
								json: true,
								body: {
									url: '={{ $parameter.source === "url" ? $parameter.url : undefined }}',
									html: '={{ $parameter.source === "html" ? $parameter.htmlInput : undefined }}',
									screenshotOptions: '={{ $parameter.screenshotOptions && $parameter.screenshotOptions.length > 0 && $parameter.screenshotOptions[0].screenshotItem ? {...$parameter.screenshotOptions[0].screenshotItem, clip: $parameter.screenshotOptions[0].screenshotItem.clip && $parameter.screenshotOptions[0].screenshotItem.clip.length > 0 ? $parameter.screenshotOptions[0].screenshotItem.clip[0].clipItem : undefined} : undefined }}',
									viewport: '={{ $parameter.viewport && $parameter.viewport.length > 0 && $parameter.viewport[0].viewportItem ? $parameter.viewport[0].viewportItem : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
									addScriptTag: '={{ $parameter.addScriptTag && $parameter.addScriptTag.length > 0 ? $parameter.addScriptTag.map(item => item.scriptItem) : undefined }}',
									addStyleTag: '={{ $parameter.addStyleTag && $parameter.addStyleTag.length > 0 ? $parameter.addStyleTag.map(item => item.styleItem) : undefined }}',
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes && $parameter.rejectResourceTypes.length > 0 ? $parameter.rejectResourceTypes : undefined }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern && $parameter.rejectRequestPattern.length > 0 ? $parameter.rejectRequestPattern : undefined }}',
									allowResourceTypes: '={{ $parameter.allowResourceTypes && $parameter.allowResourceTypes.length > 0 ? $parameter.allowResourceTypes : undefined }}',
									allowRequestPattern: '={{ $parameter.allowRequestPattern && $parameter.allowRequestPattern.length > 0 ? $parameter.allowRequestPattern : undefined }}',
									setExtraHTTPHeaders: '={{ $parameter.setExtraHTTPHeaders && Object.keys(JSON.parse($parameter.setExtraHTTPHeaders)).length > 0 ? JSON.parse($parameter.setExtraHTTPHeaders) : undefined }}',
									setJavaScriptEnabled: '={{ $parameter.setJavaScriptEnabled }}',
									userAgent: '={{ $parameter.userAgent || undefined }}',
									waitForTimeout: '={{ $parameter.waitForTimeout || undefined }}',
									emulateMediaType: '={{ $parameter.emulateMediaType || undefined }}',
									scrollPage: '={{ $parameter.scrollPage }}',
									bestAttempt: '={{ $parameter.bestAttempt }}',
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
									addScriptTag: '={{ $parameter.addScriptTag && $parameter.addScriptTag.length > 0 ? $parameter.addScriptTag.map(item => item.scriptItem) : undefined }}',
									screenshotOptions: '={{ $parameter.screenshotOptions && $parameter.screenshotOptions.length > 0 && $parameter.screenshotOptions[0].screenshotItem ? {...$parameter.screenshotOptions[0].screenshotItem, clip: $parameter.screenshotOptions[0].screenshotItem.clip && $parameter.screenshotOptions[0].screenshotItem.clip.length > 0 ? $parameter.screenshotOptions[0].screenshotItem.clip[0].clipItem : undefined} : undefined }}',
									viewport: '={{ $parameter.viewport && $parameter.viewport.length > 0 && $parameter.viewport[0].viewportItem ? $parameter.viewport[0].viewportItem : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
									rejectResourceTypes: '={{ $parameter.rejectResourceTypes && $parameter.rejectResourceTypes.length > 0 ? $parameter.rejectResourceTypes : undefined }}',
									rejectRequestPattern: '={{ $parameter.rejectRequestPattern && $parameter.rejectRequestPattern.length > 0 ? $parameter.rejectRequestPattern : undefined }}',
									allowResourceTypes: '={{ $parameter.allowResourceTypes && $parameter.allowResourceTypes.length > 0 ? $parameter.allowResourceTypes : undefined }}',
									allowRequestPattern: '={{ $parameter.allowRequestPattern && $parameter.allowRequestPattern.length > 0 ? $parameter.allowRequestPattern : undefined }}',
									setExtraHTTPHeaders: '={{ $parameter.setExtraHTTPHeaders && Object.keys(JSON.parse($parameter.setExtraHTTPHeaders)).length > 0 ? JSON.parse($parameter.setExtraHTTPHeaders) : undefined }}',
									setJavaScriptEnabled: '={{ $parameter.setJavaScriptEnabled }}',
									userAgent: '={{ $parameter.userAgent || undefined }}',
									waitForTimeout: '={{ $parameter.waitForTimeout || undefined }}',
									scrollPage: '={{ $parameter.scrollPage }}',
									bestAttempt: '={{ $parameter.bestAttempt }}',
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
									elements: '={{ $parameter.elements && $parameter.elements.length > 0 ? $parameter.elements.map(item => item.elementItem) : undefined }}',
									gotoOptions: '={{ $parameter.gotoOptions && $parameter.gotoOptions.length > 0 && $parameter.gotoOptions[0].navigationItem ? $parameter.gotoOptions[0].navigationItem : undefined }}',
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
		],
	};
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
