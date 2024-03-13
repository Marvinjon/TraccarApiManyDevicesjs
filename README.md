https://createmanydevicesintraccar.netlify.app/

Traccar Device Importer


This website automates the process of adding multiple devices to a Traccar server by reading device details from a CSV file and using the Traccar API to create each device.
Overview

The script allows bulk importing of devices into Traccar, saving time and reducing the potential for manual entry errors. It supports setting various device properties, including unique identifiers, status, group associations, and custom attributes.



CSV File Structure

The CSV file should contain the following headers:

    name: The name of the device.
    uniqueId: A unique identifier for the device, typically the IMEI number.
    status: The status of the device (optional).
    disabled: Set to true if the device is disabled; otherwise, false.
    lastUpdate: The last update time of the device in ISO 8601 format (optional).
    positionId: The ID of the last known position (optional).
    groupId: The ID of the group the device belongs to (optional).
    phone: The phone number associated with the device (optional).
    model: The model of the device (optional).
    contact: The contact information for the device (optional).
    category: The category of the device (optional).
    attributes: JSON string of additional attributes (optional).

Example CSV content:

    id,name,uniqueId,status,disabled,lastUpdate,positionId,groupId,phone,model,contact,category,attributes
    0,Vehicle 1,123456789,offline,false,2024-03-12T10:15:22Z,0,8,1234567,Discovery,Johhny,car,
    0,Vehicle 2,12345678,online,false,2024-03-12T10:15:22Z,0,9,12234567,Lambo,1234567,car,
    0,Vehicle 3,1234567,online,true,2024-03-12T10:15:22Z,0,8,1134567,fiat,me,car,
    0,Vehicle 4,1234556,offline,false,2024-03-12T10:15:22Z,0,8,2234567,suble,15,car,

Ensure there are no leading or trailing spaces around column headers or values unless they are intentional.


I also made a python script that does the same thing:
https://github.com/Marvinjon/TraccarApiManyDevices
