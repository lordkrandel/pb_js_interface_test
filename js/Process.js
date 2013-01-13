if (!Process){

    var Process = function(){

        var wmi = GetObject("winmgmts:\\\\.\\root\\CIMV2");
        var items = wmi.ExecQuery(
            "SELECT * FROM Win32_Process", 
            "WQL",
            0x10 | 0x20 // wbemFlagReturnImmediately | wbemFlagForwardOnly
        );
        var enumItems = new Enumerator(items);
        var i = 1;

        var arr = {
            get: function(i){
                return this[i];
            },
            length : 0
        };

        for (; !enumItems.atEnd(); enumItems.moveNext()) {

            var item = enumItems.item(); 
            var o = {
                caption        : item.caption,
                commandline    : item.commandline,
                csname         : item.csname,
                description    : item.Description,
                pid            : item.processid,
                status         : item.status,
                executablepath : item.executablepath,
                name           : item.name,
                priority       : item.priority
            };

            arr[arr.length] = o;
            arr.length++;

        }

        return arr;

    }
};
/* 
  string   Caption;
  string   CommandLine;
  string   CreationClassName;
  datetime CreationDate;
  string   CSCreationClassName;
  string   CSName;
  string   Description;
  string   ExecutablePath;
  uint16   ExecutionState;
  string   Handle;
  uint32   HandleCount;
  datetime InstallDate;
  uint64   KernelModeTime;
  uint32   MaximumWorkingSetSize;
  uint32   MinimumWorkingSetSize;
  string   Name;
  string   OSCreationClassName;
  string   OSName;
  uint64   OtherOperationCount;
  uint64   OtherTransferCount;
  uint32   PageFaults;
  uint32   PageFileUsage;
  uint32   ParentProcessId;
  uint32   PeakPageFileUsage;
  uint64   PeakVirtualSize;
  uint32   PeakWorkingSetSize;
  uint32   Priority;
  uint64   PrivatePageCount;
  uint32   ProcessId;
  uint32   QuotaNonPagedPoolUsage;
  uint32   QuotaPagedPoolUsage;
  uint32   QuotaPeakNonPagedPoolUsage;
  uint32   QuotaPeakPagedPoolUsage;
  uint64   ReadOperationCount;
  uint64   ReadTransferCount;
  uint32   SessionId;
  string   Status;
  datetime TerminationDate;
  uint32   ThreadCount;
  uint64   UserModeTime;
  uint64   VirtualSize;
  string   WindowsVersion;
  uint64   WorkingSetSize;
  uint64   WriteOperationCount;
  uint64   WriteTransferCount;


Properties list
        var arr = [];
        for (; !enumItems.atEnd(); enumItems.moveNext()) {

            var item = enumItems.item(); 
            var o = {
                caption : item.caption,
                commandline : item.commandline,
                description : item.description,
                pid : item.processid,
                status: item.status,
                executablepath : item.executablepath,
                name : item.name,
                priority : item.priority
            };

            arr.push(o);

        }

        return arr;
//            for (k in o){
//                WScript.echo(k + ": " + o[k]);
//            }
//            WScript.echo("");

*/
/*
    cycle over properties
    var enum2 = new Enumerator(objItem.Properties_);

    for (; !enum2.atEnd(); enum2.moveNext()){
        var propItem = enum2.item();
        WScript.Echo( propItem.name + ":" + propItem.value );
    }
*/

