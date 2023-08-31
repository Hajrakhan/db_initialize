const { DataSource } = require("typeorm");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connectDB = (connectionOptions) => {
  const dataSource = new DataSource(connectionOptions);
  return dataSource;
};
const userId1 = 1;

async function initializeDatabase(req) {
  let dataSource = await connectDB({
    ...req.connectionOptions,
    type: "postgres",
    synchronize: false,
  });
  const patientId = req.patientId;
  const adminId = req.adminId;
  const tablesToClear = [
    "Physician_work_experience",
    "comment",
    "comment_history",
    "insurance_provider_history",
    "invoice_detail_history",
    "invoice_history",
    "invoice_detail",
    "physician_diagnosis",
    "patient_payment",
    "invoice",
    "patient_allergy_history",
    "patient_allergy",
    "patient_consultation_history",
    "patient_disability",
    "patient_diagnosis_history",
    "patient_consultation",
    "patient_disability_history",
    "patient_diagnosis",
    "patient_document_history",
    "patient_insurance",
    "patient_followup_history",
    "patient_medical_report",
    "patient_immunization_history",
    "patient_immunization",
    "patient_insurance_history",
    "patient_document",
    "patient_leave_note_history",
    "patient_leave_note",
    "patient_followup",
    "patient_medical_report_history",
    "patient_medical_report_template_history",
    "patient_medicine",
    "patient_medicine_history",
    "patient_procedure",
    "patient_payment_history",
    "patient_social_history",
    "patient_procedure_history",
    "patient_referral_history",
    "patient_medical_report_template",
    "patient_social_history_history",
    "physician_clinic_appointment_detail",
    "physician_clinic_appointment",
    "physician_bank_account_history",
    "physician_clinic_slot",
    "physician_clinic",
    "physician_clinic_appointment_history",
    "physician_clinic_appointment_detail_history",
    "physician_bank_account",
    "physician_clinic_authorization_history",
    "physician_clinic_timing",
    "physician_clinic_history",
    "physician_clinic_setup_history",
    "physician_credential",
    "physician_clinic_slot_history",
    "physician_clinic_setup",
    "physician_clinic_timing_history",
    "physician_clinic_authorization",
    "physician_credential_history",
    "physician_encounter_template_history",
    "physician_history",
    "physician_work_experience",
    "physician_service_history",
    "physician_service",
    "physician_speciality_history",
    "physician_work_experience_history",
    "physician_work_experience_historytest",
    "physician_work_experiencetest",
    "physician_encounter_template",
    "physician_speciality",
    "physician",
    "user_user_feedback",
    "user_dependent_history",
    "user_dependent",
    "users_credentials",
    "user_user_feedback_history",
    "user_business_roles",
    "users_history",
    "user_preferences",
    "user_log",
    "insurance_provider",
    "users",
  ];

  try {
    //initialize database first
    await dataSource
      .initialize()
      .then(async () => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    //transaction to clear database tables
    let res = await dataSource.transaction(async (manager) => {
      try {
        // Clear data from all tables except those specified in tablesToPreserveEntries
        for (const table of tablesToClear) {
          // Get the table's columns
          const tableColumns = await manager.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='${table}'`
          );
          let res;
          let q;
          try {
            if (
              tableColumns.some((column) => column.column_name === "user_id")
            ) {
              q = `DELETE FROM ${table} WHERE user_id NOT IN  ( `;
              if (adminId) {
                q += `${adminId} , `;
              }
              if (patientId) {
                q += `${patientId} , `;
              }
              q += `${userId1} ) or user_id is null`;
              res = await manager.query(q);
            } else if (
              tableColumns.some(
                (column) => column.column_name === "primary_user_id"
              )
            ) {
              q = `DELETE FROM ${table} WHERE primary_user_id NOT IN  ( `;
              if (adminId) {
                q += `${adminId} , `;
              }
              if (patientId) {
                q += `${patientId} , `;
              }
              q += `${userId1} ) or primary_user_id is null`;
              res = await manager.query(q);
            } else {
              // q = `;
              res = await manager.query(
                `TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`
              );
            }
          } catch (error) {
            console.error(`Error deleting rows from ${table}:`, error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
      }
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

app.post("/initializeDatabase", async (req, res) => {
  try {
    // Call the function to initialize the database
    let response = await initializeDatabase(req.body);
    // Respond with success message
    res.status(200).json({ message: "Database initialized successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
