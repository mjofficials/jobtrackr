// pdf-parse's index.js runs a self-test when imported; the lib file is the
// actual parser. Re-use the published types for it.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdf from 'pdf-parse';
  export default pdf;
}
