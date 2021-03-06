# HTML → NG$templateCache

## Currently a learning project, we'll see if this actually goes somewhere…

I've been studying functional programming techniques (specifically related to JS) for a while now and want to put my education to the test!

## Setup

```bash
cd <root>
npm install
```

## Run

```bash
node index.js 'a/path/to/some/files/**/*.html'
```

```
Generates an out.js file that looks like this (WIP):

$templateCache.puts('./fixtures/dir/templ3.html', '<ul><li>Coming</li><li>From</li><li>Down</li><li>Below</li></ul>');
$templateCache.puts('./fixtures/tmpl.html', '<div><h1 ng-if="greeting == \'hi\'">{{greeting}}!</h1></div>');
$templateCache.puts('./fixtures/tmpl1.html', '<span>Working?</span>');
$templateCache.puts('./fixtures/tmpl2.html', 'Oh yes!!');
```

## Working on it…

* [x] Accept wildcard file names: `./fixtures/*.html`
* [x] Accept wildcard directory names: `./fixtures/**/*.html`
* [ ] Validate argument input
* [ ] Allow options for naming module, app refs, output etc.
* [x] Wrap html templates in `$templateCache` syntax
* [x] Wrap output in angular module
* [x] Print output to file
* [ ] Adding more items to this list
