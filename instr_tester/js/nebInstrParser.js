class nebInstrParser {

	constructor() {
		this.isConfig = false; // bool
	    this.configDict = {}; // dict
	    this.audioFileList = []; // array of obj{name,blob}
	    this.score = ""; // string
	    this.csd = "";
	    this.orcBody = "; Begin User Instr\n";
	    this.orcPreamble = "; Begin Generated Orchestra Preamble\n";
	    this.orchestra = ""; // string
	    this.scoreInfinite = "f 0 2147483641\n" + "i1 1 -10\n";
	    this.orcSetup = "; File-Looping Orc\n" + 
	    "nchnls=2\n" +
	    "0dbfs=1\n" + 
	    "; data buffers -- 100 Files maximum\n" +
	    "gilen[] init 100\n" +
	    "gichn[] init 100\n" +
	    "gSname[] init 100\n" +
	    "gisr[] init 100\n" +
	    "gipeak[] init 100\n" +
	    "; primary controls\n" +
	    "gkpitch chnexport \"pitch\", 1 \n" +
	    "gkspeed chnexport \"speed\", 1 \n" +
	    "gkloopstart chnexport \"start\", 1 \n" +
	    "gkloopsize chnexport \"size\", 1 \n" +
	    "gkdensity chnexport \"density\", 1\n" +
	    "gkoverlap chnexport \"overlap\", 1\n" +
	    "gkwindow chnexport \"window\", 1\n" +
	    "gkfilesel chnexport \"file\", 1\n" +
	    "gkfreeze chnexport \"freeze\", 1\n" +
	    "gkreset chnexport \"reset\", 1\n" +
	    "gkblend chnexport \"blend\", 1\n" +
	    "gkrecord chnexport \"record\", 1\n" +
	    "gkfilestate chnexport \"filestate\", 1\n" +
	    "gksource chnexport \"source\", 1\n" +
	    "gkeol chnexport \"eol\", 2\n" +
	    "gksizestatus chnexport \"sizestatus\", 2\n" +
	    "gkrecordstatus chnexport \"recordstatus\", 2\n" +
	    "; secondary controls\n" +
	    "gkloopstart_alt chnexport \"start_alt\", 1\n" +
	    "gkloopsize_alt chnexport \"size_alt\", 1\n" +
	    "gkdensity_alt chnexport \"density_alt\", 1\n" +
	    "gkoverlap_alt chnexport \"overlap_alt\", 1\n" +
	    "gkwindow_alt chnexport \"window_alt\", 1\n" +
	    "gkfreeze_alt chnexport \"freeze_alt\", 1\n" +
	    "gkrecord_alt chnexport \"record_alt\", 1\n" +
	    "gkreset_alt chnexport \"reset_alt\", 1\n" +
	    "gksource_alt chnexport \"source_alt\", 1\n" +
	    "gkpitch_alt chnexport \"pitch_alt\", 1\n" +
	    "gkblend_alt chnexport \"blend_alt\", 1\n";
	}

    parseContents(txt) {
        var lines = txt.split(/[\r\n]+/g);
        for (var line in lines) {
        	if (lines[line].includes("nebconfigbegin")) {
	            this.isConfig = true;
	        }
	        else if (lines[line].includes("nebconfigend")) {
	            this.isConfig = false;
	        }
	        // Populate Config Dictionary
	        if (this.isConfig) {
	            var configArray = lines[line].split(/,/);
	            if (configArray.length > 1) {
	                // Array has at least a key, and one value.
	                var key = configArray[0];
	                // TODO: Add check for valid keys.
	                var vals = [];
	                for (var i = 1; i < configArray.length; i++) {
	                    vals.push(configArray[i]);
	                }
	                this.configDict[key] = vals;
	            }
	        } else {
	            if (!lines[line].includes("nebconfigend")) {
	                this.orcBody += lines[line] + "\n";
	            }
	        }
        }
        // TODO: Fix hardcoded defaults
        var ksmpsStr = "ksmps = 128\n";
        var srStr = "sr = 48000\n";
        if ("ksmps" in this.configDict) {
            var ksmps = this.configDict["ksmps"][0]; // Add check for valid int
            ksmpsStr = "ksmps = " + ksmps +"\n";
        } 
        if ("sr" in this.configDict) {
            var sr = this.configDict["sr"][0]; // Add check for valid int
            srStr = "sr = " + sr +"\n";
        } 
        this.orcPreamble = this.orcPreamble + ksmpsStr + srStr + "; End Generated Orchestra Preamble\n";
        this.orchestra = this.orcPreamble + this.orcSetup + this.orcBody;
    }

    fillAudioList(filelist) {
    	console.log("Filling Audio File List");
    	this.audioFileList = filelist;
    }

    generateSco() {
    	var score = "";
    	score += this.scoreInfinite;
    	for (var i = 0; i < this.audioFileList.length; i++) {
    		var f = this.audioFileList[i].url;
    		score += "f " + (400 + i) + " 0 0 1 \"" + f + "\" 0 0 1\n";
    		score += "gSname[" + i +"] = \"" + f + "\"\n";
            score += "gilen[" + i +"] filelen \"" + f + "\"\n";
            score += "gichn[" + i +"] filenchnls \"" + f + "\"\n";
            score += "gisr[" + i +"] filesr \"" + f + "\"\n";
            score += "gipeak[" + i +"] filepeak \"" + f + "\"\n";
        	score += "ginumfiles init " + this.audioFileList.length + "\n";
    	}
    	this.score = score;
    }

    generateCsd() {
    	this.generateSco();
    	var csd = this.orchestra + this.score;
    	this.csd = csd;
    }

    getCsd() {
    	return this.csd;
    }
}