on replaceText(findText, replacementText, sourceText)
	set AppleScript's text item delimiters to findText
	set textItems to every text item of sourceText
	set AppleScript's text item delimiters to replacementText
	set sourceText to textItems as text
	set AppleScript's text item delimiters to ""
	return sourceText
end replaceText

on jsonString(value)
	set escapedValue to value as text
	set escapedValue to my replaceText(character id 92, (character id 92) & (character id 92), escapedValue)
	set escapedValue to my replaceText(character id 34, (character id 92) & (character id 34), escapedValue)
	set escapedValue to my replaceText(character id 10, (character id 92) & "n", escapedValue)
	set escapedValue to my replaceText(character id 13, (character id 92) & "r", escapedValue)
	set escapedValue to my replaceText(character id 9, (character id 92) & "t", escapedValue)
	return (character id 34) & escapedValue & (character id 34)
end jsonString

on jsonNumber(value)
	-- AppleScript follows the user's decimal separator; JSON always requires a dot.
	return my replaceText(",", ".", value as text)
end jsonNumber

on errorJSON(errorCode, errorMessage)
	return "{\"ok\":false,\"appRunning\":true,\"state\":\"error\",\"errorCode\":" & my jsonString(errorCode) & ",\"errorMessage\":" & my jsonString(errorMessage) & "}"
end errorJSON

on run
	try
		if application id "com.spotify.client" is not running then
			return "{\"ok\":true,\"appRunning\":false,\"state\":\"closed\",\"title\":\"\",\"artist\":\"\",\"album\":\"\",\"artwork\":\"\",\"durationMs\":0,\"positionSec\":0,\"trackId\":\"\"}"
		end if

		tell application id "com.spotify.client"
			set playbackState to (player state as text)
			if playbackState is "stopped" then
				return "{\"ok\":true,\"appRunning\":true,\"state\":\"stopped\",\"title\":\"\",\"artist\":\"\",\"album\":\"\",\"artwork\":\"\",\"durationMs\":0,\"positionSec\":0,\"trackId\":\"\"}"
			end if

			set currentItem to current track
			set trackTitle to ""
			set trackArtist to ""
			set albumTitle to ""
			set trackDuration to 0
			set playbackPosition to 0
			try
				set trackTitle to name of currentItem
			end try
			try
				set trackArtist to artist of currentItem
			end try
			try
				set albumTitle to album of currentItem
			end try
			try
				set trackDuration to duration of currentItem
			end try
			try
				set playbackPosition to player position
			end try
			try
				set artworkURL to artwork url of currentItem
			on error
				set artworkURL to ""
			end try
			try
				set persistentId to id of currentItem
			on error
				set persistentId to trackTitle & "|" & trackArtist & "|" & (trackDuration as text)
			end try
		end tell

		return "{\"ok\":true,\"appRunning\":true,\"state\":" & my jsonString(playbackState) & ",\"title\":" & my jsonString(trackTitle) & ",\"artist\":" & my jsonString(trackArtist) & ",\"album\":" & my jsonString(albumTitle) & ",\"artwork\":" & my jsonString(artworkURL) & ",\"durationMs\":" & my jsonNumber(trackDuration) & ",\"positionSec\":" & my jsonNumber(playbackPosition) & ",\"trackId\":" & my jsonString(persistentId) & "}"
	on error errorMessage number errorNumber
		if errorNumber is -1743 then
			return my errorJSON("permission_denied", "O macOS bloqueou a automação do Spotify.")
		end if
		return my errorJSON("applescript_error", "Erro " & errorNumber & ": " & errorMessage)
	end try
end run
