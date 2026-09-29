const state = {
    participants: [],
    expenses: []
};


   
// DOM ELEMENTS
   

const participantName =
    document.getElementById("participantName");

const addParticipantBtn =
    document.getElementById("addParticipantBtn");

const participantsWrap =
    document.getElementById("participantsWrap");

const expenseDesc =
    document.getElementById("expenseDesc");

const expenseAmount =
    document.getElementById("expenseAmount");

const expensePayer =
    document.getElementById("expensePayer");

const expenseParticipants =
    document.getElementById("expenseParticipants");

const splitMode =
    document.getElementById("splitMode");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const customSharesArea =
    document.getElementById("customSharesArea");

const expensesList =
    document.getElementById("expensesList");

const balancesWrap =
    document.getElementById("balancesWrap");

const totalPeople =
    document.getElementById("totalPeople");

const totalSpent =
    document.getElementById("totalSpent");

const totalExpenses =
    document.getElementById("totalExpenses");

const settlePlan =
    document.getElementById("settlePlan");

const resetBtn =
    document.getElementById("resetBtn");

const exportBtn =
    document.getElementById("exportBtn");


// LOCAL STORAGE

function saveState() {
    localStorage.setItem(
        "smartSplitState",
        JSON.stringify(state)
    );
}


function loadState() {
    const saved =
        localStorage.getItem("smartSplitState");

    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);

        state.participants =
            parsed.participants || [];

        state.expenses =
            parsed.expenses || [];

    } catch (error) {
        console.error(
            "Could not load saved data:",
            error
        );
    }
}


   
// PARTICIPANTS
   

function renderParticipants() {

    participantsWrap.innerHTML = "";

    expensePayer.innerHTML =
        '<option value="">Select payer</option>';


    if (state.participants.length === 0) {

        participantsWrap.innerHTML =
            `<div class="empty-state">
                No participants yet.
            </div>`;

    } else {

        state.participants.forEach(
            (person, index) => {

                // Chip
                const chip =
                    document.createElement("div");

                chip.className = "chip";

                const name =
                    document.createElement("strong");

                name.textContent = person;


                const remove =
                    document.createElement("button");

                remove.textContent = "×";

                remove.title =
                    "Remove participant";


                remove.addEventListener(
                    "click",
                    () => {

                        removeParticipant(index);

                    }
                );


                chip.appendChild(name);
                chip.appendChild(remove);

                participantsWrap.appendChild(chip);


                // Payer option
                const option =
                    document.createElement("option");

                option.value = person;
                option.textContent = person;

                expensePayer.appendChild(option);
            }
        );
    }


    renderExpenseParticipants();

    totalPeople.textContent =
        state.participants.length;
}


function removeParticipant(index) {

    const person =
        state.participants[index];


    const used =
        state.expenses.some(
            expense =>
                expense.payer === person ||
                Object.prototype.hasOwnProperty.call(
                    expense.shares,
                    person
                )
        );


    if (used) {

        alert(
            "This participant is already part of an expense. Delete those expenses first."
        );

        return;
    }


    state.participants.splice(
        index,
        1
    );


    saveState();

    renderAll();
}


addParticipantBtn.addEventListener(
    "click",
    () => {

        const name =
            participantName.value.trim();


        if (!name) {

            alert(
                "Enter a participant name."
            );

            return;
        }


        if (
            state.participants.includes(name)
        ) {

            alert(
                "This participant already exists."
            );

            return;
        }


        state.participants.push(name);

        participantName.value = "";

        saveState();

        renderAll();
    }
);


participantName.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            addParticipantBtn.click();

        }
    }
);


   
// EXPENSE PARTICIPANTS
   

function renderExpenseParticipants() {

    expenseParticipants.innerHTML = "";


    if (
        state.participants.length === 0
    ) {

        expenseParticipants.innerHTML =
            `<div class="empty-state">
                Add participants first.
            </div>`;

        return;
    }


    state.participants.forEach(
        person => {

            const label =
                document.createElement("label");

            label.className =
                "person-checkbox";


            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.value = person;


            const span =
                document.createElement("span");

            span.textContent = person;


            label.appendChild(checkbox);
            label.appendChild(span);

            expenseParticipants.appendChild(
                label
            );
        }
    );
}


   
// CUSTOM SHARES
   

function renderCustomSharesInputs() {

    customSharesArea.innerHTML = "";


    if (
        splitMode.value !== "custom"
    ) {
        return;
    }


    const selected =
        getSelectedParticipants();


    if (selected.length === 0) {

        customSharesArea.innerHTML =
            `<div class="empty-state">
                Select participants above first.
            </div>`;

        return;
    }


    const title =
        document.createElement("p");

    title.className = "expense-meta";

    title.textContent =
        "Enter the exact amount each participant owes.";

    customSharesArea.appendChild(title);


    selected.forEach(person => {

        const row =
            document.createElement("div");

        row.className =
            "custom-share-row";


        const label =
            document.createElement("strong");

        label.textContent =
            person;


        const input =
            document.createElement("input");

        input.type = "number";

        input.min = "0";

        input.step = "0.01";

        input.placeholder = "₹0.00";

        input.dataset.person =
            person;


        row.appendChild(label);
        row.appendChild(input);

        customSharesArea.appendChild(
            row
        );
    });
}


function getSelectedParticipants() {

    return [
        ...expenseParticipants.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    ].map(
        checkbox => checkbox.value
    );
}


expenseParticipants.addEventListener(
    "change",
    () => {

        if (
            splitMode.value === "custom"
        ) {

            renderCustomSharesInputs();

        }
    }
);


splitMode.addEventListener(
    "change",
    () => {

        renderCustomSharesInputs();

    }
);


   
// ADD EXPENSE
   

addExpenseBtn.addEventListener(
    "click",
    () => {

        if (
            state.participants.length === 0
        ) {

            alert(
                "Add participants first."
            );

            return;
        }


        const desc =
            expenseDesc.value.trim() ||
            "Expense";


        const amount =
            parseFloat(
                expenseAmount.value
            );


        const payer =
            expensePayer.value;


        const selectedParticipants =
            getSelectedParticipants();


        if (
            isNaN(amount) ||
            amount <= 0
        ) {

            alert(
                "Enter a valid amount."
            );

            return;
        }


        if (!payer) {

            alert(
                "Select who paid."
            );

            return;
        }


        if (
            selectedParticipants.length === 0
        ) {

            alert(
                "Select at least one participant."
            );

            return;
        }


        // The payer must participate
        if (
            !selectedParticipants.includes(
                payer
            )
        ) {

            alert(
                "The payer must be included in the participants for this expense."
            );

            return;
        }


        const shares = {};


            
        // EQUAL SPLIT
            

        if (
            splitMode.value === "equal"
        ) {

            const share =
                amount /
                selectedParticipants.length;


            selectedParticipants.forEach(
                person => {

                    shares[person] =
                        Number(
                            share.toFixed(2)
                        );

                }
            );


            // Correct rounding difference
            const assigned =
                Object.values(shares)
                    .reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    );


            const difference =
                Number(
                    (
                        amount -
                        assigned
                    ).toFixed(2)
                );


            if (difference !== 0) {

                shares[
                    selectedParticipants[0]
                ] += difference;

            }

        }


            
        // CUSTOM SPLIT
            

        else {

            const inputs =
                customSharesArea.querySelectorAll(
                    "input"
                );


            let sum = 0;


            inputs.forEach(input => {

                const value =
                    parseFloat(
                        input.value
                    ) || 0;


                shares[
                    input.dataset.person
                ] = value;


                sum += value;
            });


            if (sum <= 0) {

                alert(
                    "Enter the custom shares."
                );

                return;
            }


            if (
                Math.abs(
                    sum - amount
                ) > 0.01
            ) {

                alert(
                    `Custom shares must add up to ₹${amount.toFixed(2)}. Current total: ₹${sum.toFixed(2)}`
                );

                return;
            }


            for (
                const person in shares
            ) {

                shares[person] =
                    Number(
                        shares[
                            person
                        ].toFixed(2)
                    );

            }
        }


            
        // SAVE EXPENSE
            

        state.expenses.push({

            id:
                Date.now(),

            desc,

            amount:
                Number(
                    amount.toFixed(2)
                ),

            payer,

            shares

        });


        expenseDesc.value = "";

        expenseAmount.value = "";

        expensePayer.value = "";

        splitMode.value = "equal";


        expenseParticipants
            .querySelectorAll(
                'input[type="checkbox"]'
            )
            .forEach(
                checkbox =>
                    checkbox.checked = false
            );


        customSharesArea.innerHTML = "";


        saveState();

        renderAll();
    }
);


   
// EXPENSE HISTORY
   

function renderExpenses() {

    expensesList.innerHTML = "";


    if (
        state.expenses.length === 0
    ) {

        expensesList.innerHTML =
            `<div class="empty-state">
                No expenses yet.
            </div>`;

        return;
    }


    state.expenses.forEach(
        (expense, index) => {

            const item =
                document.createElement("div");

            item.className =
                "expense-item";


            const left =
                document.createElement("div");


            const title =
                document.createElement("div");

            title.className =
                "expense-title";

            title.textContent =
                expense.desc;


            const meta =
                document.createElement("div");

            meta.className =
                "expense-meta";


            const participants =
                Object.keys(
                    expense.shares
                );


            meta.textContent =
                `${expense.payer} paid • ${participants.join(", ")}`;


            left.appendChild(title);

            left.appendChild(meta);


            const right =
                document.createElement("div");

            right.className =
                "expense-right";


            const amount =
                document.createElement("div");

            amount.className =
                "expense-amount";

            amount.textContent =
                `₹${expense.amount.toFixed(2)}`;


            const deleteBtn =
                document.createElement("button");

            deleteBtn.className =
                "delete-btn";

            deleteBtn.textContent =
                "Delete";


            deleteBtn.addEventListener(
                "click",
                () => {

                    state.expenses.splice(
                        index,
                        1
                    );

                    saveState();

                    renderAll();
                }
            );


            right.appendChild(amount);

            right.appendChild(deleteBtn);


            item.appendChild(left);

            item.appendChild(right);


            expensesList.appendChild(
                item
            );
        }
    );
}


   
// BALANCES
   

function calculateBalances() {

    const balances = {};


    state.participants.forEach(
        person => {

            balances[person] = {

                paid: 0,

                share: 0,

                net: 0

            };
        }
    );


    state.expenses.forEach(
        expense => {

            balances[
                expense.payer
            ].paid += expense.amount;


            for (
                const person in expense.shares
            ) {

                if (
                    balances[person]
                ) {

                    balances[
                        person
                    ].share +=
                        expense.shares[
                            person
                        ];

                }
            }
        }
    );


    for (
        const person in balances
    ) {

        balances[person].paid =
            Number(
                balances[
                    person
                ].paid.toFixed(2)
            );


        balances[person].share =
            Number(
                balances[
                    person
                ].share.toFixed(2)
            );


        balances[person].net =
            Number(
                (
                    balances[
                        person
                    ].paid -
                    balances[
                        person
                    ].share
                ).toFixed(2)
            );
    }


    return balances;
}


   
// RENDER BALANCES
   

function renderBalances() {

    const balances =
        calculateBalances();


    balancesWrap.innerHTML = "";


    const people =
        Object.entries(
            balances
        );


    if (
        people.length === 0
    ) {

        balancesWrap.innerHTML =
            `<div class="empty-state">
                Add an expense to see balances.
            </div>`;

        return;
    }


    people.forEach(
        ([person, data]) => {

            const row =
                document.createElement("div");

            row.className =
                "balance";


            const name =
                document.createElement("div");

            name.className =
                "balance-person";

            name.textContent =
                person;


            const info =
                document.createElement("div");

            info.className =
                "balance-info";


            const details =
                document.createElement("div");

            details.className =
                "balance-detail";

            details.innerHTML =
                `Paid ₹${data.paid.toFixed(2)}<br>
                 Share ₹${data.share.toFixed(2)}`;


            const status =
                document.createElement("div");

            status.className =
                "balance-status";


            if (
                data.net > 0.01
            ) {

                status.classList.add(
                    "pos"
                );

                status.textContent =
                    `gets ₹${data.net.toFixed(2)}`;

            } else if (
                data.net < -0.01
            ) {

                status.classList.add(
                    "neg"
                );

                status.textContent =
                    `owes ₹${Math.abs(
                        data.net
                    ).toFixed(2)}`;

            } else {

                status.classList.add(
                    "settled"
                );

                status.textContent =
                    "settled";
            }


            info.appendChild(details);

            info.appendChild(status);


            row.appendChild(name);

            row.appendChild(info);


            balancesWrap.appendChild(
                row
            );
        }
    );
}


   
// SETTLEMENT
   

function renderSettlement() {

    const balances =
        calculateBalances();


    const debtors = [];

    const creditors = [];


    for (
        const person in balances
    ) {

        const net =
            balances[
                person
            ].net;


        if (
            net < -0.01
        ) {

            debtors.push({

                person,

                amount:
                    Math.abs(net)

            });

        } else if (
            net > 0.01
        ) {

            creditors.push({

                person,

                amount: net

            });
        }
    }


    settlePlan.innerHTML = "";


    if (
        debtors.length === 0 &&
        creditors.length === 0
    ) {

        settlePlan.innerHTML =
            `<div class="empty-state">
                Everyone is settled up 🎉
            </div>`;

        return;
    }


    debtors.sort(
        (a, b) =>
            b.amount - a.amount
    );


    creditors.sort(
        (a, b) =>
            b.amount - a.amount
    );


    let i = 0;

    let j = 0;


    while (
        i < debtors.length &&
        j < creditors.length
    ) {

        const debtor =
            debtors[i];

        const creditor =
            creditors[j];


        const payment =
            Math.min(
                debtor.amount,
                creditor.amount
            );


        const item =
            document.createElement("div");

        item.className =
            "settlement-item";


        item.textContent =
            `${debtor.person} pays ${creditor.person} ₹${payment.toFixed(2)}`;


        settlePlan.appendChild(
            item
        );


        debtor.amount =
            Number(
                (
                    debtor.amount -
                    payment
                ).toFixed(2)
            );


        creditor.amount =
            Number(
                (
                    creditor.amount -
                    payment
                ).toFixed(2)
            );


        if (
            debtor.amount <= 0.01
        ) {

            i++;
        }


        if (
            creditor.amount <= 0.01
        ) {

            j++;
        }
    }
}


   
// STATS
   

function updateStats() {

    const spent =
        state.expenses.reduce(
            (sum, expense) =>
                sum + expense.amount,
            0
        );


    totalSpent.textContent =
        `₹${spent.toFixed(2)}`;


    totalExpenses.textContent =
        state.expenses.length;


    totalPeople.textContent =
        state.participants.length;
}


   
// RESET
   

resetBtn.addEventListener(
    "click",
    () => {

        if (
            !confirm(
                "Reset all participants and expenses?"
            )
        ) {

            return;
        }


        state.participants = [];

        state.expenses = [];


        saveState();

        renderAll();
    }
);


   
// EXPORT CSV
   

exportBtn.addEventListener(
    "click",
    () => {

        const balances =
            calculateBalances();


        let csv =
            "Name,Total Paid,Total Share,Net Balance\n";


        for (
            const person in balances
        ) {

            const data =
                balances[person];


            csv +=
                `"${person}",${data.paid},${data.share},${data.net}\n`;
        }


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            "smartsplit-balances.csv";


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );
    }
);


   
// RENDER EVERYTHING
   

function renderAll() {

    renderParticipants();

    renderExpenses();

    renderBalances();

    renderSettlement();

    updateStats();
}


   
// START APP
   

loadState();

renderAll();