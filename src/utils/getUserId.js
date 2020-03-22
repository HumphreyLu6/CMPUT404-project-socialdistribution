
function getUserId (id) {
    var idWithHost = String(id);
    var pureId = idWithHost.split("/")[4];
    return pureId;
}

export default getUserId
