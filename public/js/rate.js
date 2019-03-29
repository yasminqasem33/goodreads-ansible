var rateValue = 0;
var readStatus = "";
let arrRead = []
let arrReading = []
let arrWantToRead = []

document.getElementById('star1').addEventListener('click', function () {
    rateValue = 1;
    console.log("RATE 1")

    staring(rateValue);
});

document.getElementById('star2').addEventListener('click', function () {
    rateValue = 2;
    staring(rateValue);
    console.log("star2 clicked");
});
document.getElementById('star3').addEventListener('click', function () {
    rateValue = 3;
    staring(rateValue);
    console.log("star3 clicked");
});
document.getElementById('star4').addEventListener('click', function () {
    rateValue = 4;
    staring(rateValue);
    console.log("star4 clicked");
});
document.getElementById('star5').addEventListener('click', function () {
    rateValue = 5;
    console.log(document.getElementById('star5'))
    staring(rateValue);
    console.log("star5 clicked");

})

arrRead = document.getElementsByClassName('read')
for (let i = 0; i < arrRead.length; i++) {
    arrRead[i].addEventListener("click", function () {
        readStatus = "read"
        reading(readStatus, i);
    }, false);
}
arrReading = document.getElementsByClassName('reading')
for (let i = 0; i < arrReading.length; i++) {
    arrReading[i].addEventListener("click", function () {
        readStatus = "reading"
        reading(readStatus, i);
    }, false);
}
arrWantToRead = document.getElementsByClassName('wanttoread')
for (let i = 0; i < arrWantToRead.length; i++) {
    arrWantToRead[i].addEventListener("click", function () {
        readStatus = "wanttoread"
        reading(readStatus, i);
    }, false);
}

function reading(read, i) {
    console.log(read)
    let arr2 = document.getElementsByClassName('bookId')
    let bookId = arr2[i].id
    $.ajax
        ({
            type: "POST",
            url: "http://localhost:5000/homepage/status",
            crossDomain: true,
            dataType: "json",
            data: { readingStatus: read, bookId: bookId }
        }).done(function (data) {
            alert("ajax callback response:" + JSON.stringify(data));
        })
};

function staring(star) {
    $.ajax
        ({
            type: "POST",
            url: "http://localhost:5000/homepage/rates",
            crossDomain: true,
            dataType: "json",
            data: { starValue: star }
        }).done(function (data) {
            alert("ajax callback response:" + JSON.stringify(data));
        })
};