# SCOL-R

SCOL-R (Shareable Cross Origin Learning Resources) helps you connect pedagogical content with an LMS through the SCORM API even when the two are on different domains.

To get started:

- Set the remote content's URL in the `body`'s `data-source` attribute in [index.html](index.html#L13).
- Edit [imsmanifest.xml](imsmanifest.xml) to edit the course title and identifier, as well as the metadata.
- Compile everything (except the README file) in a zip file and upload it to your LMS.

The SCORM Adapter intends to be compatible with SCORM versions 1.2 and 2004, hopefully with more to come.
The version should be specified in the manifest's `schemaversion` metadata attribute.

----
v1.0.0 :
💣 Breaking changes :

We remove LMSCommit after SetValue, now you have to handle it from your side for offline SCORM.

We put LMSCommit as debounce (500ms) after each setValue

----

Made with ❤️ by [Didask](https://www.didask.com/)
