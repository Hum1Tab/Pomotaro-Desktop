!macro customUnInstall
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customUnInstall"

  MessageBox MB_YESNO "設定データや履歴も一緒に削除しますか？$\n$\n「はい」を選ぶと、すべてのデータが完全に削除されます。$\n（後で再インストールしてもデータは復元できません）" /SD IDNO IDYES deleteData IDNO keepData

  deleteData:
    RMDir /r "$APPDATA\pomotaro"
    Goto done

  keepData:
    ; Do nothing, data remains

  done:
!macroend
