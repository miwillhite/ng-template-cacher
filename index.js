const fs = require('fs');
const glob = require('glob');
const Task = require('data.task');
const futurize = require('futurize').futurize(Task);
const IO = require('fantasy-io');
const { List, Map } = require('immutable-ext');
const { __
      , chain
      , compose
      , curry
      , curryN
      , join
      , map
      , mapObjIndexed
      , merge
      , objOf
      , pipe
      , reduce
      , sequence
      , tap
      , traverse
      , trim
      , tryCatch
      , unary
      , values
      } = require('ramda');
const readFile = curryN(2, futurize(fs.readFile));
const writeFile = curryN(2, futurize(fs.writeFile));
const unsafePerform = io => io.unsafePerform();
const lines = unary(require('sanctuary').lines); // Why do I need unary here? seems like it should work without
const escape = require('escape-quotes');
const mapEntries = curryN(2, (fn, o) => mapObjIndexed(fn, o.toObject()));


const moduleTmpl = exprs => (
`(function () {
  'use strict';
  var module;
  try {
    module = angular.module('templates');
  } catch(err) {
    module = angular.module('templates', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    ${exprs}
  }]);
}());
`);

//    cacheTmpl :: String -> String -> String
const cacheTmpl = curry((path, html) => `$templateCache.puts('${path}', '${html}');`);

//    getFileList :: IO List String
const getFileList = new IO(function () {
  return List(glob.sync(process.argv[2]));
});

//    ioToTask :: IO a -> Task a
const ioToTask = tryCatch(
  compose(Task.of, unsafePerform),
  Task.rejected
);

//    buildFileContentMap :: List String -> Object<String, String>
const buildFileContentMap = reduce((xs, name) =>
  merge(xs, objOf(name, readFile(name, 'utf-8'))), {});

//    mapFileContents :: List String -> Task Map<String,String>
const mapFileContents = compose(sequence(Task.of), Map, buildFileContentMap);

//    applyEntryTemplate :: String -> String -> Object<String, String>
const applyEntryTemplate = function applyEntryTemplate (str, filename) {
  return compose(
    cacheTmpl(filename),
    escape,
    join(''),
    map(trim),
    lines
  )(str);
};

//    wrapInModuleTemplate :: String -> String
const wrapInModuleTemplate = moduleTmpl;

//    joinTemplates :: Object<String, String> -> String
const joinTemplates = compose(join('\n'), values);

//    main :: IO List String -> ()
const main = pipe(
  ioToTask,
  chain(mapFileContents),
  map(mapEntries(applyEntryTemplate)),
  map(joinTemplates),
  map(wrapInModuleTemplate),
  chain(writeFile('out.js'))
);

main(getFileList).fork(console.error, () => console.log("Success!"));
