```
rm soco_scorm.zip && find . -type f \( -name "*.js" -o -name "*.html" -o -name "*.xml" \) ! -path "./node_modules/*" -print | zip soco_scorm.zip -@
```
