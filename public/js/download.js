$(document).ready(function() {
    $(".download-file-button").click(function() {
        var filePath = $(this).data("fileurl");
        var fileName = $(this).data("filename");
        var accessToken = $(this).data("access_token");
        var url = '/file/download/' + filePath
        if (accessToken) {
            url = url + `?access=${accessToken}`
        }
        $.ajax({
            url: url,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (data) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(data);
                a.href = url;
                a.download = fileName;
                document.body.append(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function (data) {
                error(data)
            }
        });
    })

    $(".share-file-button").click(function() {
        var fileId = $(this).data("fileid");
        var url = '/file/createLink/' + fileId
        $.ajax({
            url: url,
            method: 'GET',
            dataType: "json",
            success: function (data) {
                console.log(data.path)
                $(`#copy-on-click-${fileId}`).val(`${location.protocol}//${location.host}${data.path}`);
                $(`#copy-on-click-${fileId}`).show();
            }
        });
    })

    $(".copy-on-click").click(function() {
        $(this).focus();
        $(this).select();
        document.execCommand("copy");
    })
})
