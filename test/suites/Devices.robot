*** Settings ***
Resource  ../resources/keywords.robot
Resource  ../resources/variables.robot

Suite Setup    Load Project and Login

Test Setup    Run Keywords     
...    Go To Page    Devices    AND
...    Remove All Devices

*** Test Cases ***
Add New Device:
    Add New Device     AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
    Check Device Info  AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20

Edit Device:
    Add New Device     AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
    Edit Device        AirScale BTS 1    AirScale BTS 2
    Check Device Info  AirScale BTS 2    TIM Test Lab    09:30    23:00    2    20

Remove Device:
    Add New Device     AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
    Click Device Option  AirScale BTS 1  Remove
    Wait For Elements State  "Device removed successfully!"
    Run Keyword And Expect Error  *
    ...  Check Device Info  AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20  
  
Remove Device At Index:
    Add New Device         AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
    Add New Device         AirScale BTS 2    TIM Test Lab 2    09:30    23:00    1    20
    Add New Device         AirScale BTS 3    TIM Test Lab    09:30    23:00    2    20
    
    Click Device Option by Index   2    Remove
    Wait For Elements State    "Device removed successfully!"

    Sleep    2s

    Check Device Info  AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
    Check Device Info  AirScale BTS 3    TIM Test Lab    09:30    23:00    2    20
    Run Keyword And Expect Error    *
    ...    Check Device Info  AirScale BTS 2    TIM Test Lab 2    09:30    23:00    1    20