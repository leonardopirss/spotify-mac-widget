on jsonString(value)
	set valueText to value as text
	set AppleScript's text item delimiters to character id 34
	set pieces to every text item of valueText
	set AppleScript's text item delimiters to (character id 92) & (character id 34)
	set escapedValue to pieces as text
	set AppleScript's text item delimiters to ""
	return (character id 34) & escapedValue & (character id 34)
end jsonString

on failure(errorCode, errorMessage)
	return "{\"ok\":false,\"errorCode\":" & my jsonString(errorCode) & ",\"errorMessage\":" & my jsonString(errorMessage) & "}"
end failure

on run arguments
	if (count of arguments) is 0 then return my failure("invalid_action", "Nenhuma ação foi informada.")
	set requestedAction to item 1 of arguments
	if requestedAction is not in {"toggle", "play", "pause", "next", "previous", "seek"} then
		return my failure("invalid_action", "Ação não permitida.")
	end if

	try
		if application id "com.spotify.client" is not running then
			return my failure("spotify_closed", "O Spotify está fechado.")
		end if

		tell application id "com.spotify.client"
			if requestedAction is "toggle" then
				playpause
			else if requestedAction is "play" then
				play
			else if requestedAction is "pause" then
				pause
			else if requestedAction is "next" then
				next track
			else if requestedAction is "previous" then
				previous track
			else if requestedAction is "seek" then
				if (count of arguments) is less than 2 then return my failure("invalid_position", "Posição ausente.")
				set requestedMilliseconds to item 2 of arguments as integer
				if requestedMilliseconds is less than 0 then return my failure("invalid_position", "Posição inválida.")
				set player position to requestedMilliseconds / 1000
			end if
		end tell
		return "{\"ok\":true}"
	on error errorMessage number errorNumber
		if errorNumber is -1743 then return my failure("permission_denied", "O macOS bloqueou a automação do Spotify.")
		return my failure("applescript_error", "Erro " & errorNumber & ": " & errorMessage)
	end try
end run
