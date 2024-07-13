import { firebaseConfig } from "./config.js";
//@ts-ignore Import module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
//@ts-ignore Import
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
class FirebaseClient {
    static _instance;
    app = initializeApp(firebaseConfig);
    _db = getDatabase(this.app);
    static get instance() {
        if (FirebaseClient._instance === undefined) {
            FirebaseClient._instance = new FirebaseClient();
        }
        return FirebaseClient._instance;
    }
    get db() {
        return this._db;
    }
}
export { FirebaseClient };
//# sourceMappingURL=FirebaseClient.js.map