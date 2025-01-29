Set Padding 4
Set Margin 0
Set FontSize 10
Set Width 860
Set Height 580
Set FontFamily "Monospace"

Output build/readme.gif
Set Theme "GitHub Dark"

Hide
Type "asciinema rec --overwrite build/readme.cast"
Enter
Sleep 2s
Show
Sleep 1s

Type "bat --decorations never examples/readme.js"
Enter
Sleep 5s

Type "./k6 run -q examples/readme.js"
Enter

# Overview
Sleep 10s

Hide

Ctrl+D
