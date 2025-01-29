/**
 * **Web crawler API for k6**
 *
 * A programmable web crawler, which enables testing of web sites in [Grafana k6](https://grafana.com/docs/k6/latest/) using the visitor pattern.
 * The [JavaScript API](https://crawler.x.k6.io) allows you to create and easily program web crawlers.
 * In the callback functions of the crawler, custom logic can be used for testing.
 *
 * @example
 * ```js
 * import { Crawler } from "k6/x/crawler";
 *
 * export default function () {
 *   const c = new Crawler({ max_depth: 2 });
 *
 *   c.onHTML("a[href]", (e) => {
 *     if (e.attr("href").startsWith("/")) {
 *       e.request.visit(e.attr("href"));
 *     }
 *   });
 *
 *   c.onResponse((r) => {
 *     console.log(r.status_code, r.request.url);
 *   });
 *
 *   c.visit("https://grafana.com");
 * }
 * ```
 *
 * The crawler is programmed using so-called callback functions. In the example above, two callback functions are registered.
 *
 * With {@link Crawler.onHTML}, you can register a callback function that will run on HTML elements that match the selector parameter.  The callback function parameter is the matching {@link HTMLElement}.
 *
 * Normally, the {@link Crawler.onHTML} callback function is responsible for collecting the URLs to be crawled and placing them in a queue. This is usually done using the {@link Request.visit} function of the {@link Request} object belonging to the {@link HTMLElement}.
 *
 * ```javascript
 *   c.onHTML("a[href]", (e) => {
 *     // ...
 *     e.request.visit(e.attr("href"));
 *   });
 * ```
 *
 * With the {@link Crawler.onRequest} callback function, you can customize the HTTP request before it is executed. The parameter of the callback function is the {@link Request} object.
 *
 * ```javascript
 *   c.onRequest((r) => {
 *     // ...
 *   });
 * ```
 *
 * The {@link Crawler.onResponse} callback function is called after the response has been received. The callback function parameter is the {@link Response} object.
 *
 * ```javascript
 *   c.onResponse((r) => {
 *     // ...
 *   });
 * ```
 *
 * The {@link Crawler.visit} function can be used to initiate the download of a given URL and the execution of registered callback functions.
 *
 * ```javascript
 *   c.visit("https://grafana.com");
 * ```
 * @module crawler
 */
export as namespace crawler;

/**
 * This is the crawler module's main class.
 *
 * @example
 * ```js
 * import { Crawler } from "k6/x/crawler";
 *
 * export default function () {
 *   const c = new Crawler({ max_depth: 2 });
 *
 *   c.onHTML("a[href]", (e) => {
 *     if (e.attr("href").startsWith("/")) {
 *       e.request.visit(e.attr("href"));
 *     }
 *   });
 *
 *   c.onResponse((r) => {
 *     console.log(r.status_code, r.request.url);
 *   });
 *
 *   c.visit("https://grafana.com");
 * }
 * ```
 */
export declare class Crawler {
  /**
   * Creates a new instance of Crawler.
   * {@link Options} that modify the behavior of the Crawler can be passed in the optional opts parameter.
   *
   * @param opts - options
   *
   * @example
   * ```js
   * const c = new Crawler({ max_depth: 2, parse_http_error_response: true });
   * ```
   */
  constructor(opts?: Options);

  /**
   * Starts Crawlers's collecting job by creating a request to the URL specified in parameter.
   * It also calls the previously provided callbacks.
   *
   * @param url start URL
   *
   * @example
   * ```javascript
   * c.visit("https://grafana.com");
   * ```
   */
  visit(url: string): void;

  /**
   * Register a function to be called on every HTML element matched by the selector parameter.
   *
   * Processing different HTML elements can be conveniently done using multiple onHTML callbacks.
   *
   * @param selector element selector
   * @param cb callback function
   *
   * @example
   *
   * ```javascript
   * c.onHTML("title", (e) => {
   *   titles[e.request.url] = e.text;
   * });
   *
   * c.onHTML("a[href]", (e) => {
   *   e.request.ctx.put("page_href", e.request.url);
   *   e.request.ctx.put("link_text", e.text);
   *   e.request.visit(e.attr("href"));
   * });
   * ```
   *
   */
  onHTML(selector: string, cb: HTMLCallback): void;

  /**
   * Deregister the function associated with the given selector.
   *
   * @param selector element selector
   */
  onHTMLDetach(selector: string): void;

  /**
   * Register a function to be called on every request.
   *
   * With the onRequest callback function, you can customize the HTTP request before it is executed.
   *
   * @param cb callback function
   *
   * @example
   * ```javascript
   * c.onRequest((r) => {
   *   // ...
   * });
   * ```
   */
  onRequest(cb: RequestCallback): void;

  /**
   * Register a function to be called on every response.
   *
   * The onResponse callback function is called after the response has been received.
   *
   * @param cb callback function
   *
   * @example
   * ```javascript
   * c.onResponse((r) => {
   *   // ...
   * });
   * ```
   */
  onResponse(cb: ResponseCallback): void;

  /**
   * Register a function to be called on every response when headers and status are already received,
   * but body is not yet read.
   *
   * Like in onRequest, you can call request.abort to abort the transfer.
   * This might be useful if, for example, you're following all hyperlinks, but want to avoid downloading files.
   *
   * @param cb callback function
   */
  onResponseHeaders(cb: ResponseHeadersCallback): void;

  /**
   * Register a function to be called at the end of scraping.
   * Function will be executed after onHTML, as a final part of the scraping.
   *
   * @param cb callback function
   */
  onScraped(cb: ScrapedCallback): void;
}

/**
 * Options that modify the {@link Crawler}'s behavior.
 *
 * @example
 * ```js
 * const c = new Crawler({ max_depth: 2, parse_http_error_response: true });
 * ```
 */
export declare interface Options {
  /**
   * user_agent is the User-Agent string used by HTTP requests.
   */
  user_agent: string;
  /**
   * max_depth limits the recursion depth of visited URLs.
   *  Set it to 0 for infinite recursion (default).
   */
  max_depth: number;
  /**
   * allowed_domains is a domain whitelist.
   * Leave it blank to allow any domains to be visited.
   */
  allowed_domains: string[];
  /**
   * disallowed_domains is a domain blacklist.
   */
  disallowed_domains: string[];
  /**
   * disallowed_url_filters is a list of regular expressions which restricts
   * visiting URLs. If any of the rules matches to a URL the
   * request will be stopped. disallowed_url_filters will
   * be evaluated before URLFilters.
   * Leave it blank to allow any URLs to be visited.
   */
  disallowed_url_filters: string[];
  /**
   * url_filters is a list of regular expressions which restricts
   * visiting URLs. If any of the rules matches to a URL the
   * request won't be stopped. disallowed_url_filters will
   * be evaluated before url_filters.
   * Leave it blank to allow any URLs to be visited.
   */
  url_filters: string[];
  /**
   * allow_url_revisit allows multiple downloads of the same URL.
   */
  allow_url_revisit: boolean;
  /**
   * max_body_size is the limit of the retrieved response body in bytes.
   * 0 means unlimited.
   * The default value for max_body_size is 10MB (10 * 1024 * 1024 bytes).
   */
  max_body_size: number;
  /**
   * cache_dir specifies a location where GET requests are cached as files.
   * When it's not defined, caching is disabled.
   */
  cache_dir: string;
  /**
   * ignore_robots_txt allows the Crawler to ignore any restrictions set by
   * the target host's robots.txt file.  See http://www.robotstxt.org/ for more
   * information.
   */
  ignore_robots_txt: boolean;
  /**
   * parse_http_error_response allows parsing HTTP responses with non 2xx status codes.
   * By default, only successful HTTP responses will be parsed. Set parse_http_error_response
   * to true to enable it.
   */
  parse_http_error_response: boolean;
  /**
   * id is the unique identifier of a crawler.
   */
  id: number;
  /**
   * detect_charset can enable character encoding detection for non-utf8 response bodies
   * without explicit charset declaration.
   */
  detect_charset: boolean;
  /**
   * check_head performs a HEAD request before every GET to pre-validate the response.
   */
  check_head: boolean;
}

/**
 * The representation of a HTML tag.
 */
export declare interface HTMLElement {
  /**
   * The name of the tag.
   */
  name: string;
  /**
   * The text content of the element.
   */
  text: string;
  /**
   * The request object of the element's HTML document.
   */
  request: Request;
  /**
   * The Response object of the element's HTML document.
   */
  response: Response;
  /**
   * Stores the position of the current element within all the elements matched by an onHTML callback.
   */
  index: number;

  /**
   * Returns the selected attribute of a HTMLElement or empty string if no attribute found.
   *
   * @param selector attribure selector
   */
  attr(selector: string): string | undefined;

  /**
   * Returns the stripped text content of the first matching element's attribute.
   *
   * @param selector element selector
   * @param aname attribute name
   */
  childAttr(selector: string, aname: string): string | undefined;

  /**
   * Returns the stripped text content of all the matching element's attributes.
   *
   * @param selector element selector
   * @param aname attribute name
   */
  childAttrs(selector: string, aname: string): string[] | undefined;

  /**
   * Returns the concatenated and stripped text content of the matching elements.
   *
   * @param selector element selector
   */
  childText(selector: string): string;

  /**
   * Returns the stripped text content of all the matching elements.
   * @param selector element selector
   */
  childTexts(selector: string): string[];

  /**
   * Iterates over the elements matched by the first argument and calls the callback function on every HTMLElement match.
   *
   * @param selector element selector
   * @param cb callback function
   */
  forEach(selector: string, cb: ForEachCallback): void;

  /**
   * Iterates over the elements matched by the first argument and calls the callback function on every HTMLElement match.
   * It is identical to forEach except that it is possible to break out of the loop by returning false in the callback function.
   *
   * @param selector element selector
   * @param cb callback function
   */
  forEachWithBreak(selector: string, cb: ForEachWithBreakCallback): void;
}

/**
 * Context provides a tiny layer for passing data between callbacks.
 *
 * For example, the {@link Crawler.onHTML} callback function puts data into the context.
 *
 * ```javascript
 * c.onHTML("a[href]", (e) => {
 *   // ...
 *   e.request.ctx.put("page_href", e.request.url);
 *   e.request.ctx.put("link_text", e.text);
 *   //...
 * ```
 *
 * The {@link Crawler.onResponse} callback function reads the data previously put by the {@link Crawler.onHTML} callback from the context.
 *
 * ```javascript
 * c.onResponse((r) => {
 *   const page_href = r.request.ctx.get("page_href");
 *   // ...
 * ```
 */
export declare interface Context {
  /**
   * Retrieves a string value from Context. Get returns an empty string if key not found.
   *
   * @param key key to get
   */
  get(key: string): string;
  /**
   * Retrieves a value from Context. GetAny returns null if key not found.
   *
   * @param key key to get
   */
  getAny(key: string): unknown;
  /**
   * Stores a value of any type in Context.
   *
   * @param key key to store
   * @param value value to store
   */
  put(key: string, value: unknown): void;
}

/**
 * Represents the key-value pairs in an HTTP header.
 */
export declare interface Header {
  /**
   * Adds the key, value pair to the header. It appends to any existing values associated with key.
   *
   * @param key key to store
   * @param value value to store
   */
  add(key: string, value: string): void;
  /**
   * Deletes the values associated with key.
   *
   * @param key key to delete
   */
  del(key: string): void;
  /**
   * Gets the first value associated with the given key.
   * If there are no values associated with the key, returns empty string.
   *
   * @param key key to get
   */
  get(key: string): string;
  /**
   * Sets the header entries associated with key to the single element value.
   * It replaces any existing values associated with key.
   *
   * @param key key to set
   * @param value value to set
   */
  set(key: string, value: string): void;
  /**
   * Returns all values associated with the given key.
   *
   * @param key key to return
   */
  values(key: string): string[];
  /**
   * Returns all header names.
   */
  keys(): string[];
}

/**
 * The representation of a HTTP request
 */
export declare interface Request {
  /**
   * URL of the HTTP request.
   */
  url: string;
  /**
   * Contains the Request's HTTP headers.
   */
  headers: Header;
  /**
   * ctx is a context between a Request and a Response.
   */
  ctx: Context;
  /**
   * The number of the parents of the request.
   */
  depth: number;
  /**
   * The HTTP method of the request
   */
  method: string;
  /**
   * The character encoding of the response body.
   * Leave it blank to allow automatic character encoding of the response body.
   * It is empty by default and it can be set in onRequest callback.
   */
  response_character_encoding: string;
  /**
   * The Unique identifier of the request.
   */
  id: number;
  /**
   * The proxy address that handles the request
   */
  proxy_url: string;
  /**
   * Visit continues Crawler's collecting job by creating a request and preserves the Context of the previous request.
   * Visit also calls the previously provided callbacks.
   *
   * @param url URL to visit
   */
  visit(url: string): void;
}

/**
 * The representation of a HTTP response.
 */
export declare interface Response {
  /**
   * the status code of the Response.
   */
  status_code: number;
  /**
   * A context between a Request and a Response.
   */
  ctx: Context;
  /**
   * The Request object of the response.
   */
  request: Request;
  /**
   * Contains the Response's HTTP headers.
   */
  headers: Header;
}

/**
 * The type of callback function registered by {@link Crawler.onHTML}.
 *
 * @param element the current HTML element
 */
export declare type HTMLCallback = (element: HTMLElement) => void;

/**
 * The type of callback function registered by {@link Crawler.onRequest}.
 *
 * @param request the current request
 */
export declare type RequestCallback = (request: Request) => void;

/**
 * The type of callback function registered by {@link Crawler.onResponse}.
 *
 * @param response the current response
 */
export declare type ResponseCallback = (response: Response) => void;

/**
 * The type of callback function registered by {@link Crawler.onResponseHeaders}.
 *
 * @param response the current response
 */
export declare type ResponseHeadersCallback = (response: Response) => void;

/**
 * The type of callback function registered by {@link Crawler.onScraped}.
 *
 * @param response the current response
 */
export declare type ScrapedCallback = (response: Response) => void;

/**
 * The type of callback function registered by {@link HTMLElement.forEach}.
 *
 * @param index the current index
 * @param element the current element
 */
export declare type ForEachCallback = (index: number, element: HTMLElement) => void;

/**
 * The type of callback function registered by {@link HTMLElement.forEachWithBreak}.
 *
 * @param index the current index
 * @param element the current element
 *
 * @returns true to continue or false to break
 */
export declare type ForEachWithBreakCallback = (index: number, element: HTMLElement) => boolean;
