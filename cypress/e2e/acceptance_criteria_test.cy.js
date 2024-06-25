describe("Paylocity Benefits Dashboard ", () => {
  it("Check log in and employee dashboard page", () => {
    cy.visit("Prod/Benefits");

    cy.log("**Intercept Get Employee List call**");
    cy.intercept({ method: "GET", url: "Prod/api/employees" }, (req) => {
      req.headers["Authorization"] = Cypress.env("authToken");
    }).as("getEmployeeList");

    cy.wait("@getEmployeeList")
      .its("request.headers")
      .should("have.property", "Authorization", Cypress.env("authToken"));

    cy.log("**Intercept Add Employee call**");
    cy.intercept({ method: "POST", url: "Prod/api/employees" }, (req) => {
      req.headers["Content-Type"] = "application/json";
      req.headers["Authorization"] = Cypress.env("authToken");
    }).as("addEmployee");

    cy.log("**Click Add Employee, fill employee info and add employee**");
    cy.findByRole("button")
      .should("be.visible")
      .and("contain", "Add Employee")
      .click();

    const dependentsCount = Math.floor(Math.random() * 32) + 1;
    const firstName = "TestFirstName";
    const lastName = "TestLastName";

    cy.get("#firstName").type(firstName);
    cy.get("#lastName").type(lastName);
    cy.get("#dependants").type(dependentsCount);
    cy.get("#addEmployee").click();

    cy.wait("@addEmployee")
      .its("request.headers")
      .then((addEmployeeHeaders) => {
        expect(addEmployeeHeaders).to.have.property(
          "Content-Type",
          "application/json"
        );
        expect(addEmployeeHeaders).to.have.property(
          "Authorization",
          Cypress.env("authToken")
        );
      });

    cy.log("**Intercept Update Employee call**");
    cy.wait("@getEmployeeList");
    cy.intercept({ method: "PUT", url: "Prod/api/employees" }, (req) => {
      req.headers["Content-Type"] = "application/json";
      req.headers["Authorization"] = Cypress.env("authToken");
    }).as("updateEmployee");

    cy.log("**Check employee info**");
    const grossPayPerPay = 2000;
    const grossYearlySalary = 26 * grossPayPerPay;
    const employeeBenefitsCostPerPay = 1000 / 26;
    const dependentsBenefitCostPerPay = (500 / 26) * dependentsCount;
    const totalBenefitsCostPerPay = (
      employeeBenefitsCostPerPay + dependentsBenefitCostPerPay
    ).toFixed(2);
    const netPayPerPay = (grossPayPerPay - totalBenefitsCostPerPay).toFixed(2);

    cy.get("tbody tr td").eq(1).should("contain", firstName);
    cy.get("tbody tr td").eq(2).should("contain", lastName);
    cy.get("tbody tr td").eq(3).should("contain", dependentsCount);
    cy.get("tbody tr td").eq(4).should("contain", grossYearlySalary);
    cy.get("tbody tr td").eq(5).should("contain", grossPayPerPay);
    cy.get("tbody tr td").eq(6).should("contain", totalBenefitsCostPerPay);
    cy.get("tbody tr td").eq(7).should("contain", netPayPerPay);

    cy.log("**Open Update Employee modal and update employee**");
    cy.get("table tbody tr td .fa-edit").eq(0).click();

    cy.get("#employeeModal").within(() => {
      cy.get(".form-group")
        .eq(0)
        .should("be.visible")
        .and("contain", "First Name");
      cy.get(".form-group")
        .eq(1)
        .should("be.visible")
        .and("contain", "Last Name");
      cy.get(".form-group")
        .eq(2)
        .should("be.visible")
        .and("contain", "Dependents");
      cy.get('.modal-header button[data-dismiss="modal"]')
        .should("be.visible")
        .click();
    });

    const updFirstName = "UpdatedFirstName";
    const updLastName = "UpdatedLastName";
    const updDependentsCount = Math.floor(Math.random() * 32) + 1;

    cy.get("table tbody tr td .fa-edit").eq(0).click();

    cy.get("#firstName").should("be.visible").clear().type(updFirstName);
    cy.get("#lastName").should("be.visible").clear().type(updLastName);
    cy.get("#dependants").should("be.visible").clear().type(updDependentsCount);
    cy.get("#updateEmployee").should("contain", "Update").click();
    cy.wait("@updateEmployee");
    cy.wait("@getEmployeeList");

    const updDependentsBenefitCostPerPay = (500 / 26) * updDependentsCount;
    const updTotalBenefitsCostPerPay = (
      employeeBenefitsCostPerPay + updDependentsBenefitCostPerPay
    ).toFixed(2);
    const updNetPayPerPay = (
      grossPayPerPay - updTotalBenefitsCostPerPay
    ).toFixed(2);

    cy.log("**Check updated employee's info**");
    cy.get("tbody tr td").eq(1).should("contain", updFirstName);
    cy.get("tbody tr td").eq(2).should("contain", updLastName);
    cy.get("tbody tr td").eq(3).should("contain", updDependentsCount);
    cy.get("tbody tr td").eq(4).should("contain", grossYearlySalary);
    cy.get("tbody tr td").eq(5).should("contain", grossPayPerPay);
    cy.get("tbody tr td").eq(6).should("contain", updTotalBenefitsCostPerPay);
    cy.get("tbody tr td").eq(7).should("contain", updNetPayPerPay);

    cy.log("**Intercept Delete Employee call**");
    cy.intercept({ method: "DELETE", url: "Prod/api/employees/*" }, (req) => {
      req.headers["Authorization"] = Cypress.env("authToken");
    }).as("deleteEmployee");

    cy.log("**Click on delete action and delete employee**");
    cy.get("table tbody tr td .fa-times").eq(0).click();
    cy.get(".modal-body .row .col-sm-12")
      .contains("Delete employee record for")
      .should("be.visible");
    cy.get("#deleteFirstName").contains(updFirstName).should("be.visible");
    cy.get("#deleteLastName").contains(updLastName).should("be.visible");

    cy.get("#deleteEmployee").contains("Delete").click();
    cy.wait("@deleteEmployee");

    cy.get("tbody tr td").contains("No employees found.").should("be.visible");
  });
});
