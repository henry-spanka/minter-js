(function () {
    var minter = function (market) {
        document.getElementsByClassName("m-loan-entry").forEach(child => {
            let term = parseInt(child.children[market == 'secondary' ? 4 : 6].children[1].innerHTML.replace('(', '').replace(')', ''));
            let available_investment = parseFloat(child.children[7].innerText.replace('€', '').trim().replace(/ /g, ''));

            if (market == 'secondary') {
                if (term < 2) {
                    child.style.display = "none";
                    return;
                }
                if (available_investment > 200.00) {
                    child.style.display = "none";
                    return;
                }
            }

            let loanId = child.firstChild.firstChild.firstChild.firstChild.getAttribute('href').split('/')[4];

            fetch("https://www.mintos.com/webapp/en/" + loanId + "/?&referrer=https://www.mintos.com&hash=")
                .then(async response => {
                    if (response.ok) {
                        let el = document.createElement('html');
                        el.innerHTML = await response.text();
                        let details = el.getElementsByTagName('body')[0].getElementsByClassName("m-loan-card-col m-loan-card-col--details")[0].firstChild.children[1].firstChild;

                        let loan_amount = parseFloat(details.children[1].children[1].innerText.replace('€', '').trim().replace(/ /g, ''));
                        let remaining_principal = parseFloat(details.children[2].children[1].innerText.replace('€', '').trim().replace(/ /g, ''));
                        let remaining_principal_perc = parseFloat(remaining_principal / loan_amount * 100).toFixed(2);

                        let sched_extensions = parseInt(details.children[10].children[1].innerText.split('(')[0].trim()) | 0;

                        if (sched_extensions == 0 && (remaining_principal_perc < 50 || market == 'primary')) {
                            child.style.backgroundColor = "green";
                        } else if (sched_extensions < 2 && (remaining_principal_perc < 65 || market == 'primary')) {
                            child.style.backgroundColor = "orange";
                        } else {
                            child.style.backgroundColor = "red";
                        }

                        let minterTd;

                        if ((child.children.length == 10 && market == 'secondary') || (child.children.length == 9 && market == 'primary')) {
                            minterTd = document.createElement('td');
                            child.appendChild(minterTd);
                        } else {
                            minterTd = child.children[market == 'secondary' ? 11 : 10];
                        }

                        minterTd.innerHTML = remaining_principal + " € / " + loan_amount + " € (" + remaining_principal_perc + "%), Extensions: " + sched_extensions;
                    }
                })
        });
    };

    let tableHeader = document.getElementById("secondary-market-table")
    let market = 'secondary';

    if (tableHeader === null) {
        tableHeader = document.getElementById("primary-market-table");
        if (tableHeader === null) {
            console.log("Not on Primary or Secondary Market");
            return;
        } else {
            market = 'primary';
        }
    }

    tableHeader = tableHeader.firstChild.firstChild;

    if ((tableHeader.children.length == 10 && market == 'secondary') || (tableHeader.children.length == 9 && market == 'primary')) {
        let minterTh = document.createElement('th');
        let minterDiv = document.createElement('div');
        minterDiv.classList = "invest-all-button-wrapper";
        
        let minterButton = document.createElement('button');
        minterButton.innerText = "Minter Details";
        minterButton.classList = "btn btn-default trigger-open invest-in-everything";
        minterButton.onclick = () => minter(market);

        let minterBr = document.createElement('br');
        minterDiv.appendChild(minterButton);
        minterTh.appendChild(minterDiv);
        minterTh.appendChild(minterBr);
        tableHeader.appendChild(minterTh);
    }
}());
