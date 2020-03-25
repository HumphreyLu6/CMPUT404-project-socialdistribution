
function convertTime(time) {
    // Reference: https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
    // eslint-disable-next-line no-extend-native
    Date.prototype.toIsoString = function() {
        var tzo = -this.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function(num) {
                var norm = Math.floor(Math.abs(num));
                return (norm < 10 ? '0' : '') + norm;
            };
        return this.getFullYear() +
            '-' + pad(this.getMonth() + 1) +
            '-' + pad(this.getDate()) +
            'T' + pad(this.getHours()) +
            ':' + pad(this.getMinutes()) +
            ':' + pad(this.getSeconds()) +
            dif + pad(tzo / 60) +
            ':' + pad(tzo % 60);
    }

    var mountainTime = time.toLocaleString({timeZone: "america/denver"});
    mountainTime = new Date(mountainTime);
    return mountainTime.toIsoString();
}

export default convertTime;