module.exports = {
    iso
}

function iso() {
    let ts = Date.now(); let date_ob = new Date(ts);
    let date = date_ob.getDate(); let month = date_ob.getMonth() + 1; let year = date_ob.getFullYear();
    const iso_date = year + "-" + (month < 10 ? ("0" + month) : month) + "-" + date;
    return iso_date;
}