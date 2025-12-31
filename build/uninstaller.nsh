!macro customUnInstall
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customUnInstall"

  ; Ask the user if they want to delete data, but default to /SD IDNO (No) which means Keep Data.
  ; Also default the button focus to NO.
  MessageBox MB_YESNO|MB_DEFBUTTON2 "設定データや履歴も一緒に削除しますか？$\n$\n「はい」を選ぶと、すべてのデータが完全に削除されます。$\n（通常は「いいえ」を選択してください）" /SD IDNO IDYES deleteData IDNO keepData

  deleteData:
    RMDir /r "$APPDATA\pomotaro"
    Goto done

  keepData:
    ; Do nothing, data remains

  done:
!macroend
