if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // --- IMPORTANT: Update the path below with your GitHub Pages subdirectory if needed ---
        // Example: '/StudentManagement/service-worker.js' instead of '/service-worker.js'
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Error registering Service Worker:', error);

              const errorMessageElement = document.getElementById('error-message');
              if (errorMessageElement) {
                  errorMessageElement.textContent = "Failed to register Service Worker. PWA features may not be available.";
                  errorMessageElement.style.display = 'block';
                  setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 5000);
              }
        });
    });
}


const installButton = document.getElementById('installButton');

function hideInstallButtonIfInstalled() {

    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is running in standalone mode.');
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {

        if (installButton) {

            installButton.style.display = 'none';
        }
    }
}

window.addEventListener('load', hideInstallButtonIfInstalled);

let deferredInstallPrompt = null;


window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired');
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installButton) {
        installButton.style.display = 'block';
    }
});

if (installButton) {
    installButton.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredInstallPrompt = null;
            installButton.style.display = 'none';
        }
    });
}

window.addEventListener('appinstalled', (evt) => {
    console.log('appinstalled', evt);
    if (installButton) {
        installButton.style.display = 'none';
    }
});


const firebaseConfig = {
    apiKey: "AIzaSyByP-tkxIQdK7dFZa9uwKqH1I4hQDYh_1U",
    authDomain: "cnhsstudentdatabase.firebaseapp.com",
    databaseURL: "https://cnhsstudentdatabase-default-rtdb.firebaseio.com",
    projectId: "cnhsstudentdatabase",
    storageBucket: "cnhsstudentdatabase.firebasestorage.app",
    messagingSenderId: "999201205232",
    appId: "1:999201205232:web:521f2720c930a2db304b35"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized.");
} else {
    console.log("Firebase already initialized.");
    firebase.app();
}

const database = firebase.database();
const studentsRef = database.ref('students');
const auth = firebase.auth();


const studentListContainer = document.getElementById('student-list-container');
const studentList = document.getElementById('students');
const searchInput = document.getElementById('search-input');

const addRecordModal = document.getElementById('addRecordModal');
const closeAddRecordModalButton = addRecordModal ? addRecordModal.querySelector('.close-button') : null;
const addRecordButton = document.getElementById('addRecordButton');
const studentFormHeader = addRecordModal ? addRecordModal.querySelector('#student-form h2') : null;
const addStudentForm = document.getElementById('add-student-form');


const studentIdInput = document.getElementById('student-id');
const lrnInput = document.getElementById('lrn');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const middleNameInput = document.getElementById('middleName');
const sexInput = document.getElementById('sex');
const contactInput = document.getElementById('contact');
const addressInput = document.getElementById('address');
const dobInput = document.getElementById('dob');
const parentsInput = document.getElementById('parents');
const guardianInput = document.getElementById('guardian');
const religionInput = document.getElementById('religion');
const fourPsInput = document.getElementById('fourPs');
const clubInput = document.getElementById('club');
const learningModalityInput = document.getElementById('learningModality');
const juniorHighGraduationDateInput = document.getElementById('juniorHighGraduationDate');
const seniorHighGraduationDateInput = document.getElementById('seniorHighGraduationDate');
const juniorHighHonorsInput = document.getElementById('juniorHighHonors');
const seniorHighHonorsInput = document.getElementById('seniorHighHonors');
const remarksInput = document.getElementById('remarks');
const notesInput = document.getElementById('notes');

const enrollmentFieldsContainer = document.getElementById('enrollment-fields');
const misconductFieldsContainer = document.getElementById('misconduct-fields');
const schoolRecordReleaseFieldsContainer = document.getElementById('school-record-release-fields');

const viewModal = document.getElementById('view-modal');
const viewStudentName = document.getElementById('view-student-name');
const viewStudentDetails = document.getElementById('view-student-details');
const closeViewModalButton = document.getElementById('closeViewModal');

const historyModal = document.getElementById('history-modal');
const historyDetails = document.getElementById('history-details');
const closeHistoryModalButton = document.getElementById('closeHistoryModal');

const bulkAddButton = document.getElementById('bulkAddButton');
const bulkAddModal = document.getElementById('bulkAddModal');
const closeBulkAddModalButton = document.getElementById('closeBulkAddModal');
const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
const addBulkRecordButton = document.getElementById('addBulkRecordButton');

const confirmationMessage = document.getElementById('confirmation-message');
const errorMessage = document.getElementById('error-message');

const authContainer = document.getElementById('auth-container');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authLoginButton = document.getElementById('auth-login');
const authSignupButton = document.getElementById('auth-signup');
const authLogoutButton = document.getElementById('auth-logout');
const mainContentDiv = document.getElementById('main-content');
const userInfoPara = document.getElementById('user-info');

if (!authContainer || !authEmailInput || !authPasswordInput || !authLoginButton || !authSignupButton || !authLogoutButton || !mainContentDiv || !userInfoPara) {
     console.error("One or more required authentication elements not found in index.html. Authentication functionality may not work correctly.");
      const pageBody = document.body;
      const authErrorDiv = document.createElement('div');
      authErrorDiv.style.color = 'red';
      authErrorDiv.style.fontWeight = 'bold';
      authErrorDiv.style.textAlign = 'center';
      authErrorDiv.style.marginTop = '20px';
      authErrorDiv.textContent = "Authentication form elements are missing. Please check your index.html.";
      if(pageBody) pageBody.prepend(authErrorDiv);
}

let enrollmentCounter = 0;
let misconductCounter = 0;
let schoolRecordReleaseCounter = 0;
let allStudentsData = [];
let currentViewingStudentId = null;


function renderStudents(data) {
    if (studentList) {
        studentList.innerHTML = '';
    } else {
        console.error("Student list element #students not found during render.");
        return;
    }

    if (data && data.length > 0) {
        data.forEach(studentData => {
            const student = studentData.val();
            const studentId = studentData.key;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                 <div>
                     <strong>LRN:</strong> ${student.lrn || 'N/A'}<br>
                     <strong>Name:</strong> ${student.firstName || ''} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}
                 </div>
                 <div>
                     <button class="view-btn" onclick="viewStudent('${studentId}')">View</button>
                     <button class="edit-btn" onclick="editStudent('${studentId}')">Edit</button>
                 </div>
            `;

            studentList.appendChild(listItem);
        });
    } else {
        const noResultsItem = document.createElement('li');
        const searchTerm = searchInput ? searchInput.value.trim() : "";
        noResultsItem.textContent = searchTerm === "" ? "Start typing to search for students." : "No students found matching your search.";
        noResultsItem.style.justifyContent = 'center';
        noResultsItem.style.fontStyle = 'italic';
        studentList.appendChild(noResultsItem);
    }
}

const areObjectsDeepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || !areObjectsDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
};

const isEffectivelyEmpty = (value) => {
    if (value === null || value === undefined || value === "") {
        return true;
    }
    if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
            return true;
        }
        if (value.constructor === Object && Object.keys(value).length === 0) {
            return true;
        }
    }
    return false;
};


function saveStudentData(newStudentData, studentId = null) {
    const timestamp = new Date().toISOString();
    const currentUser = firebase.auth().currentUser;

    const modifiedBy = currentUser ? currentUser.uid : 'Unknown User';
    const modifiedByUserDisplayName = currentUser ? (currentUser.displayName || currentUser.email || 'User ID: ' + modifiedBy) : 'Unknown User';
    const createdByEmail = currentUser ? currentUser.email : 'Unknown User';

    const errorMessageElement = document.getElementById('error-message');

    if (studentId) {
        console.log(`[SAVE] Attempting to update student ID: ${studentId}`);
        console.log("[SAVE] New data from form:", newStudentData);

        return Promise.all([
            studentsRef.child(studentId).get(),
            studentsRef.child(studentId).child('history').get(),
            studentsRef.child(studentId).child('schoolRecordReleaseLog').get()
        ]).then(([snapshot, mainHistorySnapshot, releaseLogSnapshot]) => {
            const oldData = snapshot.val() || {};
            const existingMainHistory = mainHistorySnapshot.val() || [];
            const existingReleaseLog = releaseLogSnapshot.val() || [];

            const mainHistoryArray = Array.isArray(existingMainHistory) ? existingMainHistory : Object.values(existingMainHistory);
            const releaseLogArray = Array.isArray(existingReleaseLog) ? existingReleaseLog : Object.values(existingReleaseLog);


            const cleanedNewStudentData = { ...newStudentData };
            const cleanedOldData = { ...oldData };

            const fieldsToCleanAndCompare = [
                'lrn', 'firstName', 'lastName', 'middleName', 'sex', 'contact', 'address',
                'dob', 'parents', 'guardian', 'religion', 'fourPs', 'club', 'learningModality',
                'juniorHighGraduationDate', 'seniorHighGraduationDate',
                'juniorHighHonors', 'seniorHighHonors', 'remarks', 'notes',
                'enrollmentHistory', 'misconductInstances', 'schoolRecordReleases'
            ];

            fieldsToCleanAndCompare.forEach(key => {
                if (cleanedNewStudentData.hasOwnProperty(key) && isEffectivelyEmpty(cleanedNewStudentData[key])) {
                    cleanedNewStudentData[key] = null;
                }
                if (cleanedOldData.hasOwnProperty(key) && isEffectivelyEmpty(cleanedOldData[key])) {
                    cleanedOldData[key] = null;
                }
            });

            console.log("[SAVE] Old data from Firebase:", oldData);
            console.log("[SAVE] Cleaned New data:", cleanedNewStudentData);
            console.log("[SAVE] Cleaned Old data:", cleanedOldData);


            const changesForMainHistory = {};

            const fieldsForMainHistory = [
                'lrn', 'firstName', 'lastName', 'middleName', 'sex', 'contact', 'address',
                'dob', 'parents', 'guardian', 'religion', 'fourPs', 'club', 'learningModality',
                'juniorHighGraduationDate', 'seniorHighGraduationDate',
                'juniorHighHonors', 'seniorHighHonors', 'remarks', 'notes',
                 'enrollmentHistory', 'misconductInstances'
            ];


            fieldsForMainHistory.forEach(key => {
                 const oldValue = cleanedOldData.hasOwnProperty(key) ? cleanedOldData[key] : null;
                 const newValue = cleanedNewStudentData.hasOwnProperty(key) ? cleanedNewStudentData[key] : null;
                 let changed = false;

                 if (key === 'fourPs') {
                      changed = (oldValue === true) !== (newValue === true);
                 } else if (typeof oldValue === 'object' || typeof newValue === 'object') {
                      const oldObj = typeof oldValue === 'object' && oldValue !== null ? oldValue : {};
                      const newObj = typeof newValue === 'object' && newValue !== null ? newValue : {};
                      changed = !areObjectsDeepEqual(oldObj, newObj);
                 }
                 else {
                      changed = oldValue !== newValue;
                 }

                 if (changed) {
                     console.log(`[SAVE] Change detected for main history field "${key}": Old=${JSON.stringify(oldValue)}, New=${JSON.stringify(newValue)}`);
                     changesForMainHistory[key] = {
                         oldValue: oldData.hasOwnProperty(key) ? oldData[key] : null,
                         newValue: newStudentData.hasOwnProperty(key) ? newStudentData[key] : null
                     };
                 }
            });

            const updateData = { ...newStudentData };

            let needsUpdate = false;

            if (Object.keys(changesForMainHistory).length > 0) {
                console.log("[SAVE] Changes for main history detected. Adding history entry.");
                const historyEntry = {
                    timestamp: timestamp,
                    changes: changesForMainHistory,
                    modifiedBy: modifiedBy,
                    modifiedByUserDisplayName: modifiedByUserDisplayName
                };
                updateData.history = [...mainHistoryArray, historyEntry];
                needsUpdate = true;
            } else {
                if (mainHistoryArray.length > 0) {
                     updateData.history = mainHistoryArray;
                } else {
                     delete updateData.history;
                }
                console.log("[SAVE] No changes for main history.");
            }

            const oldReleases = oldData.hasOwnProperty('schoolRecordReleases') ? oldData['schoolRecordReleases'] : null;
            const newReleases = newStudentData.hasOwnProperty('schoolRecordReleases') ? newStudentData['schoolRecordReleases'] : null;

            const oldReleasesArray = oldReleases && typeof oldReleases === 'object' ? Object.values(oldReleases) : [];
            const newReleasesArray = newReleases && typeof newReleases === 'object' ? Object.values(newReleases) : [];

            let newReleaseAdded = false;

            if (newReleasesArray.length > oldReleasesArray.length) {
                let match = true;
                for (let i = 0; i < oldReleasesArray.length; i++) {
                    if (!areObjectsDeepEqual(oldReleasesArray[i], newReleasesArray[i])) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    newReleaseAdded = true;
                    console.log("[SAVE] Detected addition of a new School Record Release entry. Logging to release log.");
                } else {
                    console.log("[SAVE] School Record Release data changed, but not a simple addition (entries modified or removed before adding? Not logging this change to release log).");
                }
            } else {
                console.log("[SAVE] Number of School Record Release entries did not increase. No new release added to log.");
            }


            if (newReleaseAdded) {
                 console.log("[SAVE] Adding release log entry for new release.");
                 const releaseLogEntry = {
                     timestamp: timestamp,
                     changes: {
                          oldSchoolRecordReleases: oldReleases || null,
                          newSchoolRecordReleases: newReleases || null
                     },
                     modifiedBy: modifiedBy,
                     modifiedByUserDisplayName: modifiedByUserDisplayName
                 };
                 updateData.schoolRecordReleaseLog = [...releaseLogArray, releaseLogEntry];
                 needsUpdate = true;
            } else {
                 if (releaseLogArray.length > 0) {
                      updateData.schoolRecordReleaseLog = releaseLogArray;
                 } else {
                      delete updateData.schoolRecordReleaseLog;
                 }
                 console.log("[SAVE] No new release added. School Record Release Log not explicitly updated by this trigger.");
            }


            Object.keys(newStudentData).forEach(key => {
                 if (key !== 'history' && key !== 'schoolRecordReleaseLog') {
                      const originalOldValue = oldData.hasOwnProperty(key) ? oldData[key] : null;
                      const currentNewValue = newStudentData.hasOwnProperty(key) ? newStudentData[key] : null;

                      if (isEffectivelyEmpty(currentNewValue) && !isEffectivelyEmpty(originalOldValue)) {
                           console.log(`[SAVE] Cleaning up field "${key}" (was not empty, now is): Old=${JSON.stringify(originalOldValue)}, New=${JSON.stringify(currentNewValue)}`);
                           updateData[key] = null;
                           needsUpdate = true;
                      } else if (isEffectivelyEmpty(currentNewValue) && !oldData.hasOwnProperty(key)) {
                           console.log(`[SAVE] Cleaning up new, empty field "${key}".`);
                            updateData[key] = null;
                            needsUpdate = true;
                      }
                  }
             });


            if (needsUpdate) {
                console.log("[SAVE] Performing Firebase update because changes were detected or new release added.", updateData);
                return studentsRef.child(studentId).update(updateData)
                    .then(() => {
                        console.log(`[SAVE] Successfully updated student ID: ${studentId}`);
                    })
                    .catch(error => {
                        console.error(`[SAVE] Error during Firebase update for ID ${studentId}:`, error);
                         const errorMessageElement = document.getElementById('error-message');
                         if (errorMessageElement) {
                             errorMessageElement.textContent = "Failed to update student data in Firebase.";
                             errorMessageElement.style.display = 'block';
                             setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 5000);
                         }
                        throw error;
                    });
            } else {
                console.log("[SAVE] No changes or cleanup needed. Update skipped.");
                return Promise.resolve();
            }
        })
         .catch(error => {
             console.error("[SAVE] Error during fetch for update check or update:", error);
             const errorMessageElement = document.getElementById('error-message');
             if (errorMessageElement) {
                 errorMessageElement.textContent = "An error occurred during the save operation.";
                 errorMessageElement.style.display = 'block';
                 setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 5000);
             }
             throw error;
        });

    } else {
        console.log("[SAVE] Attempting to add new student.");
        console.log("[SAVE] New data from form:", newStudentData);

        const creationDetails = {
            timestamp: timestamp,
            createdByEmail: createdByEmail
        };

        const dataToPush = { ...newStudentData };
        Object.keys(dataToPush).forEach(key => {
             if (isEffectivelyEmpty(dataToPush[key])) {
                 delete dataToPush[key];
             }
        });


        console.log("[SAVE] Data being sent to Firebase push:", dataToPush);

        return studentsRef.push(dataToPush).then(newRecord => {
            const newRecordKey = newRecord.key;
            console.log(`[SAVE] Successfully added new student with ID: ${newRecordKey}`);

            return studentsRef.child(newRecordKey).child('creationDetails').set(creationDetails)
                 .then(() => {
                     console.log(`[SAVE] Successfully added creation details for ID: ${newRecordKey}`);
                     return newRecordKey;
                 })
                 .catch(error => {
                     console.error(`[SAVE] Error setting creation details for ID ${newRecordKey}:`, error);
                      if (errorMessageElement) {
                          errorMessageElement.textContent = "Failed to set creation details for new student.";
                          errorMessageElement.style.display = 'block';
                          setTimeout(() => { errorMessageElement.style.display = 'none'; }, 5000);
                      }
                 });
        })
        .catch(error => {
             if (errorMessageElement) {
                 errorMessageElement.textContent = "Failed to save new student data.";
                 errorMessageElement.style.display = 'block';
                 setTimeout(() => { errorMessageElement.style.display = 'none'; }, 3000);
             }
             console.error("Error during save operation (add new):", error);
             throw error;
        });
    }
}


const formatHistoryComplexField = (key, value) => {
    if (isEffectivelyEmpty(value)) {
        return '<em>Empty/N/A</em>';
    }

    let html = '<ul style="margin: 0; padding-left: 20px;">';

    const entries = typeof value === 'object' && value !== null ? Object.keys(value).map(k => value[k]) : [];

     if (entries.length === 0 && (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
         return '<em>Empty/N/A</em>';
     }

    if (key === 'enrollmentHistory') {
        entries.forEach(entry => {
            html += `<li><strong>School Year:</strong> ${entry.schoolYear || 'N/A'}, <strong>Date:</strong> ${entry.enrollmentDate || 'N/A'}</li>`;
        });
    } else if (key === 'misconductInstances') {
        entries.forEach(entry => {
             html += `<li><strong>Reason:</strong> ${entry.reason || 'N/A'}, <strong>Date:</strong> ${entry.date || 'N/A'}, <strong>Persons Involved:</strong> ${entry.personsInvolved || 'N/A'}</li>`;
        });
    }
    else if (key === 'schoolRecordReleases') {
         entries.forEach(entry => {
              html += `<li><strong>Date:</strong> ${entry.releaseDate || 'N/A'}, <strong>Reason:</strong> ${entry.releaseReason || 'N/A'}, <strong>Transfer School:</strong> ${entry.transferSchool || 'N/A'}</li>`;
         });
    }
    else {
        html += `<li>${JSON.stringify(value)}</li>`;
    }
    html += '</ul>';
    return html;
};


function showHistory(studentId) {
    const historyModal = document.getElementById('history-modal');
    const historyDetails = document.getElementById('history-details');
    if (!historyModal || !historyDetails) {
        console.error("Error: history-modal or history-details element not found. Cannot show history.");
         const errorMessageElement = document.getElementById('error-message');
         if(errorMessageElement) {
             errorMessageElement.textContent = "An error occurred while loading history.";
             errorMessageElement.style.display = 'block';
             setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
         }
        return;
    }

    historyDetails.innerHTML = '';

    Promise.all([
        studentsRef.child(studentId).child('history').orderByChild('timestamp').get(),
        studentsRef.child(studentId).child('creationDetails').get()
    ]).then(([historySnapshot, creationSnapshot]) => {

        const hasCreationDetails = creationSnapshot.exists() && creationSnapshot.val();
        const hasMainHistoryEntries = historySnapshot.exists() && historySnapshot.val();

        if (hasCreationDetails) {
            const creationDetails = creationSnapshot.val();
            const creationDate = new Date(creationDetails.timestamp).toLocaleString();
            const createdByEmail = creationDetails.createdByEmail || 'Unknown User';
            const creationEntryDiv = document.createElement('div');
            creationEntryDiv.classList.add('history-entry');
            creationEntryDiv.innerHTML = `<h4>Student Record Creation</h4><p><strong>Date:</strong> ${creationDate}</p><p><strong>Created By:</strong> ${createdByEmail}</p><hr>`;
            historyDetails.appendChild(creationEntryDiv);
        }

        if (hasMainHistoryEntries) {
            const historyData = historySnapshot.val();
            const entries = Object.values(historyData);

            entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            entries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('history-entry');
                const formattedTime = new Date(entry.timestamp).toLocaleString();
                const modifiedByDisplayName = entry.modifiedByUserDisplayName || 'Unknown User';

                let changesHTML = '<p><strong>Changes:</strong></p><ul>';
                let hasChangesForDisplay = false;

                for (const key in entry.changes) {
                     if (entry.changes.hasOwnProperty(key) && key !== 'schoolRecordReleases') {
                         const change = entry.changes[key];

                         let valuesAreDifferent = true;
                         if (key === 'fourPs') {
                              valuesAreDifferent = (change.oldValue === true) !== (change.newValue === true);
                         } else if (typeof change.oldValue === 'object' || typeof change.newValue === 'object') {
                              const oldObj = typeof change.oldValue === 'object' && change.oldValue !== null ? change.oldValue : {};
                              const newObj = typeof change.newValue === 'object' && change.newValue !== null ? change.newValue : {};
                              valuesAreDifferent = !areObjectsDeepEqual(oldObj, newObj);
                         }
                         else {
                              valuesAreDifferent = change.oldValue !== change.newValue;
                         }

                         if (valuesAreDifferent) {
                             hasChangesForDisplay = true;

                             changesHTML += `<li>
                                 <strong>${key}:</strong><br>
                                 <span style="font-weight: bold;">Previous Data:</span> `;

                             if (key === 'enrollmentHistory' || key === 'misconductInstances') {
                                 changesHTML += formatHistoryComplexField(key, change.oldValue);
                             } else if (key === 'fourPs') {
                                  changesHTML += (change.oldValue === true ? 'Yes' : 'No');
                             }
                              else {
                                 changesHTML += isEffectivelyEmpty(change.oldValue) ? '<em>Empty/N/A</em>' : String(change.oldValue);
                              }

                             changesHTML += `<br><span style="font-weight: bold;">Present Data:</span> `;

                             if (key === 'enrollmentHistory' || key === 'misconductInstances') {
                                 changesHTML += formatHistoryComplexField(key, change.newValue);
                             } else if (key === 'fourPs') {
                                  changesHTML += (change.newValue === true ? 'Yes' : 'No');
                             }
                              else {
                                 changesHTML += isEffectivelyEmpty(change.newValue) ? '<em>Empty/N/A</em>' : String(change.newValue);
                              }
                             changesHTML += '</li>';
                         }
                     }
                }
                changesHTML += '</ul>';

                if (hasChangesForDisplay) {
                    entryDiv.innerHTML += `<h4>Modified At: ${formattedTime}</h4><p><strong>Modified By:</strong> ${modifiedByDisplayName}</p>${changesHTML}<hr>`;
                    historyDetails.appendChild(entryDiv);
                }
            });
        }

         const viewReleaseHistoryButton = document.createElement('button');
         viewReleaseHistoryButton.textContent = 'View School Record Releases';
         viewReleaseHistoryButton.classList.add('view-release-history-btn');
         viewReleaseHistoryButton.style.marginTop = '10px';
         viewReleaseHistoryButton.style.marginBottom = '10px';
         viewReleaseHistoryButton.onclick = () => showSchoolRecordReleaseHistory(studentId);

         historyDetails.appendChild(viewReleaseHistoryButton);


         if (!hasCreationDetails && !hasMainHistoryEntries && historyDetails.children.length === 1 && historyDetails.contains(viewReleaseHistoryButton)) {
              const noMainHistoryMessage = document.createElement('p');
              noMainHistoryMessage.textContent = "No general modification history available.";
              noMainHistoryMessage.style.fontStyle = 'italic';
              historyDetails.insertBefore(noMainHistoryMessage, viewReleaseHistoryButton);
         }

        historyModal.style.display = 'block';

    }).catch(error => {
         console.error("Failed to load main modification history:", error);
         const errorMessageElement = document.getElementById('error-message');
         let userErrorMessage = "Failed to load main modification history.";

         if (error.code === 'PERMISSION_DENIED') {
             userErrorMessage = "Permission denied to view history. Please check security rules.";
             console.error("Firebase History Fetch Error: PERMISSION_DENIED. Check your Firebase Security Rules for students/$studentId/history and students/$studentId/creationDetails.");
         } else if (error.code === 'auth/network-request-failed') {
             userErrorMessage = "Network error while fetching history. Please check your connection.";
         }
         // Add other specific checks if needed

         historyDetails.textContent = userErrorMessage; // Update modal content with specific error

         if (errorMessageElement) { // Also show in the main error element
              errorMessageElement.textContent = userErrorMessage;
              errorMessageElement.style.display = 'block';
              setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 5000); // Show specific errors longer
         }

         if (historyModal) historyModal.style.display = 'block'; // Still show modal to show error message
    });
}


function addEnrollment(schoolYear = `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`, enrollmentDate = '', isReadOnly = false) {
     enrollmentCounter++;

    const enrollmentDiv = document.createElement('div');
    enrollmentDiv.classList.add('enrollment-record');
     if (isReadOnly) {
         enrollmentDiv.classList.add('readonly-entry');
         const originalData = { schoolYear, enrollmentDate };
          enrollmentDiv.innerHTML += `<input type="hidden" class="original-enrollment-data" value='${JSON.stringify(originalData).replace(/'/g, '&apos;')}'>`;
     }

    enrollmentDiv.innerHTML += `
         <h3>Enrollment ${enrollmentCounter}</h3>
         <div>
             <label for="schoolYear_${enrollmentCounter}">School Year:</label>
             <input type="text" class="school-year" id="schoolYear_${enrollmentCounter}" value="${schoolYear}" ${isReadOnly ? 'readonly' : ''}>
         </div>
         <div>
             <label for="enrollmentDate_${enrollmentCounter}">Enrollment Date:</label>
             <input type="date" class="enrollment-date" id="enrollmentDate_${enrollmentCounter}" value="${enrollmentDate}" ${isReadOnly ? 'disabled' : ''}>
         </div>
         ${isReadOnly ? '' : '<button type="button" class="remove-btn" onclick="removeEnrollment(this)">Remove</button>'} `;

    if (enrollmentFieldsContainer) {
        enrollmentFieldsContainer.appendChild(enrollmentDiv);
    } else {
        console.error("Enrollment fields container not found. Cannot add enrollment.");
    }
}


function removeEnrollment(button) {
     const entryDiv = button ? button.closest('.enrollment-record') : null;

     if (entryDiv && !entryDiv.classList.contains('readonly-entry')) {
         entryDiv.remove();
     } else if (entryDiv) {
         console.warn("Attempted to remove a read-only enrollment entry.");
     }
}


function addMisconduct(reason = '', date = '', personsInvolved = '', isReadOnly = false) {
     misconductCounter++;
    const misconductDiv = document.createElement('div');
    misconductDiv.classList.add('misconduct-instance');
     if (isReadOnly) {
         misconductDiv.classList.add('readonly-entry');
         const originalData = { reason, date, personsInvolved };
          misconductDiv.innerHTML += `<input type="hidden" class="original-misconduct-data" value='${JSON.stringify(originalData).replace(/'/g, '&apos;')}'>`;
     }


    misconductDiv.innerHTML += `
         <h3>Misconduct Instance ${misconductCounter}</h3>
         <div>
             <label for="misconductReason_${misconductCounter}">Reason:</label>
             <textarea class="misconduct-reason" id="misconductReason_${misconductCounter}" ${isReadOnly ? 'readonly' : ''}>${reason}</textarea>
         </div>
         <div>
             <label for="misconductDate_${misconductCounter}">Date:</label>
             <input type="date" class="misconduct-date" id="misconductDate_${misconductCounter}" value="${date}" ${isReadOnly ? 'disabled' : ''}>
         </div>
         <div>
             <label for="misconductPersons_${misconductCounter}">Persons Involved:</label>
             <input type="text" class="misconduct-persons" id="misconductPersons_${misconductCounter}" value="${personsInvolved}" ${isReadOnly ? 'readonly' : ''}>
         </div>
         ${isReadOnly ? '' : '<button type="button" class="remove-btn" onclick="removeMisconduct(this)">Remove</button>'} `;

    if (misconductFieldsContainer) {
        misconductFieldsContainer.appendChild(misconductDiv);
    } else {
        console.error("Misconduct fields container not found. Cannot add misconduct instance.");
    }
}


function removeMisconduct(button) {
     const entryDiv = button ? button.closest('.misconduct-instance') : null;

     if (entryDiv && !entryDiv.classList.contains('readonly-entry')) {
         entryDiv.remove();
     } else if (entryDiv) {
         console.warn("Attempted to remove a read-only misconduct entry.");
     }
}


function addSchoolRecordRelease(releaseDate = '', releaseReason = '', transferSchool = '', isReadOnly = false) {
     schoolRecordReleaseCounter++;
    const releaseDiv = document.createElement('div');
    releaseDiv.classList.add('school-record-release-entry');

    if (isReadOnly) {
        releaseDiv.classList.add('readonly-entry');
        const originalData = { releaseDate, releaseReason, transferSchool };
         releaseDiv.innerHTML += `<input type="hidden" class="original-release-data" value='${JSON.stringify(originalData).replace(/'/g, '&apos;')}'>`;
    }

    releaseDiv.innerHTML += `
         <h3>School Record Release ${schoolRecordReleaseCounter}</h3>
         <div>
             <label for="releaseDate_${schoolRecordReleaseCounter}">Release Date:</label>
             <input type="date" class="release-date" id="releaseDate_${schoolRecordReleaseCounter}" value="${releaseDate}" ${isReadOnly ? 'disabled' : ''}>
         </div>
         <div>
             <label for="releaseReason_${schoolRecordReleaseCounter}">Reason for Release:</label>
             <textarea class="release-reason" id="releaseReason_${schoolRecordReleaseCounter}" ${isReadOnly ? 'readonly' : ''}>${releaseReason}</textarea>
         </div>
         <div>
             <label for="transferSchool_${schoolRecordReleaseCounter}">Transferring School:</label>
             <input type="text" class="transfer-school" id="transferSchool_${schoolRecordReleaseCounter}" value="${transferSchool}" ${isReadOnly ? 'readonly' : ''}>
         </div>
         ${isReadOnly ? '' : '<button type="button" class="remove-btn" onclick="removeSchoolRecordRelease(this)">Remove</button>'} `;

    if (schoolRecordReleaseFieldsContainer) {
        schoolRecordReleaseFieldsContainer.appendChild(releaseDiv);
         if (!isReadOnly && !releaseDate) {
              const dateInput = releaseDiv.querySelector('.release-date');
              if(dateInput) dateInput.valueAsDate = new Date();
         }
    } else {
        console.error("School record release fields container not found. Cannot add release entry.");
    }
}


function removeSchoolRecordRelease(button) {
     const entryDiv = button ? button.closest('.school-record-release-entry') : null;

     if (entryDiv && !entryDiv.classList.contains('readonly-entry')) {
         entryDiv.remove();
     } else if (entryDiv) {
         console.warn("Attempted to remove a read-only school record release entry.");
     }
}


function clearForm() {
    if (addStudentForm) {
        addStudentForm.reset();
    }

    if (enrollmentFieldsContainer) enrollmentFieldsContainer.innerHTML = '';
    if (misconductFieldsContainer) misconductFieldsContainer.innerHTML = '';
    if (schoolRecordReleaseFieldsContainer) schoolRecordReleaseFieldsContainer.innerHTML = '';

    enrollmentCounter = 0;
    misconductCounter = 0;
    schoolRecordReleaseCounter = 0;

    if (studentIdInput) studentIdInput.value = '';
    if (lrnInput) lrnInput.disabled = false;

    if (studentFormHeader) studentFormHeader.textContent = 'Add New Student / Edit Student';

    if (notesInput) notesInput.value = '';
    if (juniorHighGraduationDateInput) juniorHighGraduationDateInput.value = '';
    if (seniorHighGraduationDateInput) seniorHighGraduationDateInput.value = '';
    if (juniorHighHonorsInput) juniorHighHonorsInput.value = '';
    if (seniorHighHonorsInput) seniorHighHonorsInput.value = '';
    if (remarksInput) remarksInput.value = '';
}


if (closeAddRecordModalButton) {
    closeAddRecordModalButton.addEventListener('click', () => {
        if (addRecordModal) addRecordModal.style.display = 'none';
        clearForm();
    });
}
if (closeViewModalButton) {
    const viewModal = document.getElementById('view-modal');
    if (viewModal) {
       closeViewModalButton.addEventListener('click', function() {
           viewModal.style.display = "none";
       });
    } else {
        console.warn("Close View Modal button or View Modal element not found.");
    }
}
if (closeHistoryModalButton) {
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
       closeHistoryModalButton.addEventListener('click', function() {
           historyModal.style.display = "none";
       });
    } else {
         console.warn("Close History Modal button or History Modal element not found.");
    }
}
if (closeBulkAddModalButton) {
    const bulkAddModal = document.getElementById('bulkAddModal');
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
    if (bulkAddModal) {
        closeBulkAddModalButton.addEventListener('click', () => {
            bulkAddModal.style.display = 'none';
            if (bulkAddFormsContainer) bulkAddFormsContainer.innerHTML = '';
        });
    } else {
        console.warn("Close Bulk Add Modal button or Bulk Add Modal element not found.");
    }
}
const schoolReleaseHistoryModal = document.getElementById('school-release-history-modal');
const closeSchoolReleaseHistoryModalButton = schoolReleaseHistoryModal ? schoolReleaseHistoryModal.querySelector('.close-button') : null;
if (closeSchoolReleaseHistoryModalButton) {
     if (schoolReleaseHistoryModal) {
          closeSchoolReleaseHistoryModalButton.addEventListener('click', function() {
              schoolReleaseHistoryModal.style.display = 'none';
          });
     } else {
          console.warn("Close School Release History Modal button or Modal element not found.");
     }
}


window.addEventListener('click', (event) => {
    const addRecordModal = document.getElementById('addRecordModal');
    const viewModal = document.getElementById('view-modal');
    const historyModal = document.getElementById('history-modal');
    const bulkAddModal = document.getElementById('bulkAddModal');
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
    const schoolReleaseHistoryModal = document.getElementById('school-release-history-modal');

    if (addRecordModal && event.target == addRecordModal) {
        addRecordModal.style.display = 'none';
        clearForm();
    }
    if (viewModal && event.target == viewModal) {
        viewModal.style.display = "none";
    }
    if (historyModal && event.target == historyModal) {
        historyModal.style.display = "none";
    }
    if (bulkAddModal && event.target == bulkAddModal) {
        bulkAddModal.style.display = 'none';
        if (bulkAddFormsContainer) bulkAddFormsContainer.innerHTML = '';
    }
     if (schoolReleaseHistoryModal && event.target == schoolReleaseHistoryModal) {
          schoolReleaseHistoryModal.style.display = 'none';
     }
});


if (addRecordButton) {
    addRecordButton.addEventListener('click', () => {
        const addRecordModal = document.getElementById('addRecordModal');
        const studentFormHeader = addRecordModal ? addRecordModal.querySelector('#student-form h2') : null;
        const studentIdInput = document.getElementById('student-id');
        const lrnInput = document.getElementById('lrn');

        if (addRecordModal) addRecordModal.style.display = 'block';
        if (studentFormHeader) studentFormHeader.textContent = 'Add New Student';
        if (studentIdInput) studentIdInput.value = '';
        if (lrnInput) lrnInput.disabled = false;

        clearForm();
    });
}


function showSchoolRecordReleaseHistory(studentId) {
     const schoolReleaseHistoryModal = document.getElementById('school-release-history-modal');
     const schoolReleaseHistoryDetails = document.getElementById('school-release-history-details');
     const schoolReleaseHistoryStudentName = document.getElementById('school-release-history-student-name');

     if (!schoolReleaseHistoryModal || !schoolReleaseHistoryDetails || !schoolReleaseHistoryStudentName) {
          console.error("Required elements for School Record Release history modal not found.");
           const errorMessageElement = document.getElementById('error-message');
           if(errorMessageElement) {
               errorMessageElement.textContent = "School Record Release history display is not available.";
               errorMessageElement.style.display = 'block';
               setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
           }
          return;
     }


     schoolReleaseHistoryDetails.innerHTML = '';
     schoolReleaseHistoryStudentName.textContent = 'Loading...';


     studentsRef.child(studentId).get().then(snapshot => {
          if (snapshot.exists()) {
               const student = snapshot.val();
               schoolReleaseHistoryStudentName.textContent = `Releases for: ${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();

               const releaseLog = student.schoolRecordReleaseLog;

               if (releaseLog && Object.keys(releaseLog).length > 0) {
                   const logEntries = Array.isArray(releaseLog) ? releaseLog : Object.values(releaseLog);

                   logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                   let detailsHTML = '<ul>';
                   logEntries.forEach(entry => {
                       const formattedTime = new Date(entry.timestamp).toLocaleString();
                       const modifiedByDisplayName = entry.modifiedByUserDisplayName || 'Unknown User';
                        const changes = entry.changes && entry.changes.schoolRecordReleases ? entry.changes.schoolRecordReleases : { oldValue: null, newValue: null };

                        detailsHTML += `<li>
                            <h4>Release Recorded At: ${formattedTime}</h4>
                            <p><strong>Recorded By:</strong> ${modifiedByDisplayName}</p>
                            <p><strong>Details:</strong></p>
                            <ul>
                                 <li>
                                     <strong>Previous School Record Releases:</strong>
                                     ${formatHistoryComplexField('schoolRecordReleases', changes.oldValue)}
                                 </li>
                                 <li>
                                     <strong>Current School Record Releases:</strong>
                                     ${formatHistoryComplexField('schoolRecordReleases', changes.newValue)}
                                 </li>
                            </ul>
                            <hr>
                        </li>`;
                   });
                   detailsHTML += '</ul>';
                   schoolReleaseHistoryDetails.innerHTML = detailsHTML;

               } else {
                    schoolReleaseHistoryDetails.textContent = "No School Record Release history available for this student.";
               }

                schoolReleaseHistoryModal.style.display = 'block';

          } else {
               schoolReleaseHistoryDetails.textContent = "Student data not found.";
               schoolReleaseHistoryStudentName.textContent = "Error Loading History";
               schoolReleaseHistoryModal.style.display = 'block';
          }
     })
     .catch(error => {
          console.error("Failed to load School Record Release history:", error);
          const errorMessageElement = document.getElementById('error-message');
          let userErrorMessage = "Failed to load School Record Release history.";

          if (error.code === 'PERMISSION_DENIED') {
              userErrorMessage = "Permission denied to view release history. Check security rules for students/$studentId/schoolRecordReleaseLog.";
              console.error("Firebase Release History Fetch Error: PERMISSION_DENIED. Check your Firebase Security Rules for students/$studentId/schoolRecordReleaseLog.");
          } else if (error.code === 'auth/network-request-failed') {
              userErrorMessage = "Network error while fetching release history. Please check your connection.";
          }
          // Add other specific checks if needed

          schoolReleaseHistoryDetails.textContent = userErrorMessage;

          if (errorMessageElement) {
              errorMessageElement.textContent = userErrorMessage;
              errorMessageElement.style.display = 'block';
              setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 5000);
          }

          if (schoolReleaseHistoryModal) schoolReleaseHistoryModal.style.display = 'block';
     });
}


function filterAndRenderStudents() {
    const currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    if (currentSearchTerm === "") {
        renderStudents([]);
    } else {
        const results = allStudentsData.filter(studentData => {
            const student = studentData.val();
            const searchTermLower = currentSearchTerm.toLowerCase();

            return (student && student.lrn && String(student.lrn).toLowerCase().startsWith(searchTermLower)) ||
                   (student && student.firstName && student.firstName.toLowerCase().startsWith(searchTermLower)) ||
                   (student && student.lastName && student.lastName.toLowerCase().startsWith(searchTermLower));
        });
        renderStudents(results);
    }
}


studentsRef.on('value', (snapshot) => {
    const studentData = [];

    snapshot.forEach((childSnapshot) => {
        studentData.push(childSnapshot);
    });
    allStudentsData = studentData;
    console.log(`[FIREBASE] Fetched ${allStudentsData.length} student records.`);

    filterAndRenderStudents();
});

if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderStudents);
} else {
    console.error("Search input element not found.");
}


hideInstallButtonIfInstalled();

if (lrnInput) {
    lrnInput.addEventListener('keypress', function(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
        }
    });

    lrnInput.addEventListener('input', function() {
        if (this.value.length > 12) {
            this.value = this.value.slice(0, 12);
        }
    });
}

if (contactInput) {
    contactInput.addEventListener('keypress', function(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
        }
    });
}


if (bulkAddButton) {
    bulkAddButton.addEventListener('click', () => {
        const bulkAddModal = document.getElementById('bulkAddModal');
        const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');

        if (bulkAddModal) {
            bulkAddModal.style.display = 'block';
            if (bulkAddFormsContainer) bulkAddFormsContainer.innerHTML = '';
            createBulkStudentRecordFields(0);
        } else {
            console.error("Bulk add modal element not found.");
             const errorMessageElement = document.getElementById('error-message');
             if(errorMessageElement) {
                 errorMessageElement.textContent = "Bulk add functionality is not available.";
                 errorMessageElement.style.display = 'block';
                 setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
             }
        }
    });
}

if (addBulkRecordButton) {
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
    if (bulkAddFormsContainer) {
       addBulkRecordButton.addEventListener('click', () => {
            const recordCount = bulkAddFormsContainer.children.length;
            createBulkStudentRecordFields(recordCount);
       });
    } else {
        console.error("Bulk add forms container not found. Cannot add bulk record fields button listener.");
    }
}


function removeBulkStudentRecord(button) {
    const recordDiv = button ? button.closest('.bulk-student-record') : null;
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');

    if (recordDiv && bulkAddFormsContainer && bulkAddFormsContainer.contains(recordDiv)) {
        bulkAddFormsContainer.removeChild(recordDiv);

        const recordDivs = bulkAddFormsContainer.querySelectorAll('.bulk-student-record');
        recordDivs.forEach((div, index) => {
            const h3 = div.querySelector('h3');
            if (h3) {
                h3.textContent = `Student Record #${index + 1}`;

                const inputs = div.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const oldId = input.id;
                    if(oldId && oldId.includes('_')) {
                         const parts = oldId.split('_');
                         parts[parts.length - 1] = index;
                         input.id = parts.join('_');

                         const label = div.querySelector(`label[for="${oldId}"]`);
                         if(label) {
                             label.setAttribute('for', input.id);
                         }
                    }
                });
            }
        });
    } else {
         console.error("Could not find the bulk student record element to remove.");
         const errorMessageElement = document.getElementById('error-message');
         if(errorMessageElement) {
              errorMessageElement.textContent = "Could not remove the selected record.";
              errorMessageElement.style.display = 'block';
              setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
         }
    }
}


function processBulkRecordsForm() {
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
    const errorMessageElement = document.getElementById('error-message');
    const confirmationMessageElement = document.getElementById('confirmation-message');
    const bulkAddModal = document.getElementById('bulkAddModal');


    if (!bulkAddFormsContainer) {
        console.error("Bulk add forms container not found. Cannot process records.");
         if(errorMessageElement) {
             errorMessageElement.textContent = "Bulk add form not found.";
             errorMessageElement.style.display = 'block';
             setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
         }
        return;
    }

    const studentRecords = bulkAddFormsContainer.querySelectorAll('.bulk-student-record');
    let recordsProcessedSuccessfully = 0;
    let recordsFailedProcessing = 0;
    let recordsFailedSaving = 0;
    const processingPromises = [];
    const processedLrnsInBatch = new Set();

     if (studentRecords.length === 0) {
         if (errorMessageElement) {
             errorMessageElement.textContent = 'Please add at least one student record to process.';
             errorMessageElement.style.display = 'block';
             setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
         }
         return;
     }

     const validRecordsToProcess = [];
     studentRecords.forEach((recordDiv, index) => {
          const lrnInput = recordDiv.querySelector(`#bulkLrn_${index}`);
          const firstNameInput = recordDiv.querySelector(`#bulkFirstName_${index}`);
          const lastNameInput = recordDiv.querySelector(`#bulkLastName_${index}`);
          const sexSelect = recordDiv.querySelector(`#bulkSex_${index}`);
          const addressTextarea = recordDiv.querySelector(`#bulkAddress_${index}`);
          const dobInput = recordDiv.querySelector(`#bulkDob_${index}`);
          const parentsInput = recordDiv.querySelector(`#bulkParents_${index}`);
          const learningModalitySelect = recordDiv.querySelector(`#bulkLearningModality_${index}`);

          const lrn = lrnInput ? lrnInput.value.trim() : '';
          const firstName = firstNameInput ? firstNameInput.value.trim() : '';
          const lastName = lastNameInput ? lastNameInput.value.trim() : '';
          const sex = sexSelect ? sexSelect.value : '';
          const address = addressTextarea ? addressTextarea.value.trim() : '';
          const dob = dobInput ? dobInput.value : '';
          const parents = parentsInput ? parentsInput.value.trim() : '';
          const learningModality = learningModalitySelect ? learningModalitySelect.value : '';


          if (!lrn || !firstName || !lastName || !sex || !address || !dob || !parents || !learningModality) {
               console.warn(`Bulk Add: Skipping record #${index + 1} due to missing mandatory fields.`);
               recordsFailedProcessing++;
               return;
          }

          if (processedLrnsInBatch.has(lrn)) {
               console.warn(`Bulk Add: Skipping record #${index + 1} with LRN "${lrn}" because it is a duplicate within the current batch.`);
               recordsFailedProcessing++;
               return;
          }
          processedLrnsInBatch.add(lrn);

          const isDuplicateInExisting = allStudentsData.some(studentData => {
               const student = studentData.val();
               return student && student.lrn && student.lrn === lrn;
          });
          if (isDuplicateInExisting) {
               console.warn(`Bulk Add: Skipping record #${index + 1} with LRN "${lrn}" because it already exists in the database.`);
               recordsFailedProcessing++;
               return;
             }


          validRecordsToProcess.push({
               lrn: lrn,
               firstName: firstName,
               lastName: lastName,
               sex: sex,
               address: address,
               dob: dob,
               parents: parents,
               learningModality: learningModality,
               middleName: null,
               contact: null,
               guardian: null,
               religion: null,
               fourPs: false,
               club: null,
               enrollmentHistory: null,
               misconductInstances: null,
               schoolRecordReleases: null,
               juniorHighGraduationDate: null,
               seniorHighGraduationDate: null,
               juniorHighHonors: null,
               seniorHighHonors: null,
               remarks: null,
               notes: null
           });
     });

      if (validRecordsToProcess.length === 0) {
          let message = `No records were successfully processed from the batch.`;
          if (recordsFailedProcessing > 0) {
               message += ` ${recordsFailedProcessing} record(s) skipped (missing mandatory fields or duplicates).`;
          }
          if (studentRecords.length > 0) {
                if (errorMessageElement) {
                    errorMessageElement.textContent = message;
                    errorMessageElement.style.display = 'block';
                    setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 7000);
                }
          }
          if(bulkAddModal) bulkAddModal.style.display = 'none';
          if(bulkAddFormsContainer) bulkAddFormsContainer.innerHTML = '';
          return;
      }


    validRecordsToProcess.forEach((record, index) => {
        processingPromises.push(
             saveStudentData(record)
              .then(() => {
                  recordsProcessedSuccessfully++;
              })
              .catch((error) => {
                  console.error(`Bulk Add: Error saving record with LRN "${record.lrn}":`, error);
                  recordsFailedSaving++;
              })
        );
    });


    Promise.all(processingPromises)
         .then(() => {

              const totalRecordsAttempted = studentRecords.length;
              const totalRecordsFailed = recordsFailedProcessing + recordsFailedSaving;
              const totalRecordsSucceeded = recordsProcessedSuccessfully;

              let message = '';
              let messageType = 'confirmation';

              if (totalRecordsSucceeded > 0) {
                  message += `Successfully added ${totalRecordsSucceeded} record(s).`;
              }

              if (recordsFailedProcessing > 0) {
                   if (message !== '') message += ' ';
                   message += `${recordsFailedProcessing} record(s) skipped (missing mandatory fields or duplicates).`;
                   if (totalRecordsSucceeded > 0) {
                       messageType = 'confirmation';
                   } else {
                       messageType = 'error';
                   }
              }

              if (recordsFailedSaving > 0) {
                   if (message !== '') message += ' ';
                   message += `${recordsFailedSaving} record(s) failed to save to Firebase.`;
                   messageType = 'error';
              }

              if (totalRecordsAttempted === 0) {
                  message = 'No records found in the bulk add form to process.';
                  messageType = 'error';
              } else if (totalRecordsSucceeded === 0 && totalRecordsFailed === 0) {
                   message = 'Processing completed, but no records were added (check console for details).';
                   messageType = 'error';
              }


              if (messageType === 'confirmation') {
                  if(confirmationMessageElement) {
                       confirmationMessageElement.textContent = message;
                       confirmationMessageElement.style.display = 'block';
                       setTimeout(() => { if(confirmationMessageElement) confirmationMessageElement.style.display = 'none'; }, 7000);
                  }
              } else {
                  if(errorMessageElement) {
                       errorMessageElement.textContent = message;
                       errorMessageElement.style.display = 'block';
                       setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 7000);
                  }
              }

              if(bulkAddModal) bulkAddModal.style.display = 'none';
              if(bulkAddFormsContainer) bulkAddFormsContainer.innerHTML = '';
          });
}


function createBulkStudentRecordFields(recordIndex) {
    const bulkAddFormsContainer = document.getElementById('bulkAddFormsContainer');
    const errorMessageElement = document.getElementById('error-message');

    if (!bulkAddFormsContainer) {
        console.error("Bulk add forms container not found. Cannot create bulk record fields.");
         if(errorMessageElement) {
              errorMessageElement.textContent = "Cannot create form fields.";
              errorMessageElement.style.display = 'block';
              setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
          }
        return;
    }

    const recordDiv = document.createElement('div');
    recordDiv.classList.add('bulk-student-record');

    recordDiv.style.border = '1px solid #ccc';
    recordDiv.style.padding = '15px';
    recordDiv.style.marginBottom = '10px';
    recordDiv.style.borderRadius = '8px';
    recordDiv.style.backgroundColor = '#f9f9f9';


    recordDiv.innerHTML = `
         <h3>Student Record #${recordIndex + 1}</h3>
         <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
              <div>
                  <label for="bulkLrn_${recordIndex}">LRN:</label><br>
                  <input type="text" id="bulkLrn_${recordIndex}" maxlength="12" onkeypress="return event.charCode >= 48 && event.charCode <= 57" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div>
                  <label for="bulkFirstName_${recordIndex}">First Name:</label><br>
                  <input type="text" id="bulkFirstName_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div>
                  <label for="bulkLastName_${recordIndex}">Last Name:</label><br>
                  <input type="text" id="bulkLastName_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div>
                  <label for="bulkSex_${recordIndex}">Sex:</label><br>
                  <select id="bulkSex_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                      <option value="">-- Select Sex --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                  </select>
              </div>
              <div style="grid-column: span 2;"> <label for="bulkAddress_${recordIndex}">Address:</label><br>
                  <textarea id="bulkAddress_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"></textarea>
              </div>
              <div>
                  <label for="bulkDob_${recordIndex}">Date of Birth:</label><br>
                  <input type="date" id="bulkDob_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div>
                  <label for="bulkParents_${recordIndex}">Parents (Full Name):</label><br>
                  <input type="text" id="bulkParents_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div>
                  <label for="bulkLearningModality_${recordIndex}">Learning Modality:</label><br>
                  <select id="bulkLearningModality_${recordIndex}" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                      <option value="">-- Select Modality --</option>
                      <option value="Face to Face">Face to Face</option>
                      <option value="Modular Print">Modular Print</option>
                      <option value="Online">Online</option>
                      <option value="ADM">ADM</option>
                  </select>
              </div>
         </div>
         <button type="button" class="remove-bulk-record" onclick="removeBulkStudentRecord(this)" style="background-color: #dc3545; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin-top: 15px;">Remove</button>
    `;

    if (bulkAddFormsContainer) {
        bulkAddFormsContainer.appendChild(recordDiv);

         const bulkLrnInput = recordDiv.querySelector(`#bulkLrn_${recordIndex}`);
         if (bulkLrnInput) {
              bulkLrnInput.addEventListener('keypress', function(event) {
                  const charCode = (event.which) ? event.which : event.keyCode;
                  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                      event.preventDefault();
                  }
               });

              bulkLrnInput.addEventListener('input', function() {
                   if (this.value.length > 12) {
                        this.value = this.value.slice(0, 12);
                   }
               });
         }
    } else {
         console.error("Bulk add forms container not found.");

          if(errorMessageElement) {
              errorMessageElement.textContent = "Failed to add form fields.";
              errorMessageElement.style.display = 'block';
              setTimeout(() => { if(errorMessageElement) errorMessageElement.style.display = 'none'; }, 3000);
          }
    }
}
