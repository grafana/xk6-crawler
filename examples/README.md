 # Examples

Example scripts to demonstrate the use of the xk6-crawler API.

## [`example.js`](example.js)

The simplest example script to demonstrate the use of the crawler. This script is included in the README of the repository.

## [`collect-links.js`](collect-links.js)

This script collects the links crawled by the crawler and log them. The links are listed per page.

```bash
../k6 run --log-format=raw --log-output=file=collect-links.test-out.json collect-links.js
```

## [`broken-links.js`](broken-links.js)

This script checks for broken links during the crawl. It logs the found broken links. The links are listed per page.

```bash
../k6 run --log-format=raw --log-output=file=broken-links.test-out.json broken-links.js
```

## [`create-har.js`](har_example.js)

While crawling the web site, this script collects the pages and links and creates a HAR file and log its content.

```bash
../k6 run --log-format=raw --log-output=test.har create-har.js
```

The generated HAR file can be read with k6 studio or converted to a k6 script that can be used without a crawler using the [k6 HAR converter](https://github.com/grafana/har-to-k6).

```bash
har-to-k6 -o create-har.test-out.js create-har.har
```