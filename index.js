const fs = require('fs');
const glob = require('glob');
const Task = require('data.task');
const futurize = require('futurize').futurize(Task);
const IO = require('fantasy-io');
const { List } = require('immutable-ext');
const { __
      , chain
      , compose
      , curry
      , curryN
      , join
      , map
      , pipe
      , tap
      , traverse
      , trim
      , tryCatch
      , unary
      } = require('ramda');
const readFile = curryN(2, futurize(fs.readFile));
const writeFile = curryN(2, futurize(fs.writeFile));
const unsafePerform = io => io.unsafePerform();
const lines = unary(require('sanctuary').lines); // Why do I need unary here? seems like it should work without
const escape = require('escape-quotes');

//    getFileList :: IO List String
const getFileList = new IO(function () {
  return List(glob.sync(process.argv[2]));
});

//    ioToTask :: IO a -> Task a
const ioToTask = tryCatch(
  compose(Task.of, unsafePerform),
  Task.rejected
);

//    getFileContents :: Task List String -> Task List String
const getFileContents = traverse(Task.of, readFile(__, 'utf-8'));

//    wrapWithCachePuts :: String -> String
const wrapWithCachePuts = compose(
  s => `$templateCache.puts('${s}');`,
  escape,
  join(''),
  map(trim),
  lines
);

const main = pipe(
  ioToTask,
  chain(getFileContents),
  map(map(wrapWithCachePuts)),
  map(join('\n')),
  chain(writeFile('out.js'))
);

main(getFileList).fork(console.error, () => console.log("Success!"));
