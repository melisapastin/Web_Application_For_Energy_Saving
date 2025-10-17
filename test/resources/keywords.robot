*** Settings ***
Library  Browser    enable_presenter_mode=True

Resource  ./variables.robot


*** Keywords ***

Load Project
    [Documentation]
    ...    Open a new Robot Framework Browser window and navigate to the project
    New Browser    headless=False     timeout=60s
    New Context    viewport={'width': 1280, 'height': 800}
    New Page       ${FRONTEND_URL}

Attempt Login
    [Documentation]
    ...    Attempt to login with given credentials
    [Arguments]
    ...    ${username}=${TEST_USER}    
    ...    ${password}=${TEST_PASSWORD}    
    ...    ${url}=${FRONTEND_URL}
    
    Go To    ${url}

    Wait For Elements State    h6:has-text("Login")

    Type Text    input#username    ${username}
    Type Secret  input#password    $password

    Click    button:has-text("Login")
    
    Check Logged In

Check Logged In
    [Documentation]
    ...    Check that the user is logged in (sidebar menu options are visible)
    Wait For Elements State    a:has-text("Home")
    Wait For Elements State    a:has-text("Profile")
    Wait For Elements State    button:has-text("Logout")

Load Project and Login
    [Documentation]
    ...    Start a browser session and login with the default user ${TEST_USER}
    Load Project
    Attempt Login

Go To Page
    [Documentation]
    ...    Navigate to a page available in the sidebar
    [Arguments]
    ...    ${page}
    
    Click    a:has-text("${page}")

Add New Device
    [Documentation]
    ...    Add a new device (must already be on the Devices page)
    [Arguments]
    ...    ${name}
    ...    ${group}
    ...    ${on_time}
    ...    ${off_time}
    ...    ${count}
    ...    ${consumption}
    
    Fill Text    //*[@name="deviceName"]    ${name}
    Fill Text    //*[@name="group"]    ${group}
    Fill Text    //*[@name="powerOnTime"]    ${on_time}
    Fill Text    //*[@name="powerOffTime"]    ${off_time}
    Fill Text    //*[@name="count"]    ${count}
    Fill Text    //*[@name="consumptionPerHour"]    ${consumption}
    
    Click    button:has-text("Add Device")

Check Device Info
    [Documentation]
    ...    Check device information for given name in the devices table
    [Arguments]
    ...    ${name}
    ...    ${group}
    ...    ${on_time}
    ...    ${off_time}
    ...    ${count}
    ...    ${consumption}
    
    @{expected_values}    Create List    ${group}    ${on_time}    ${off_time}    ${count}    ${consumption}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr

    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        Log    ${col_name}

        IF    '${col_name}' == '${name}'
            ${row_found}=    Set Variable    ${True}
            FOR    ${i}    IN RANGE    0    5
                ${table_index}=    Evaluate                    ${i} + 1
                ${text}=           Get Text                    ${columns}[${table_index}]
                Should Be Equal    ${expected_values}[${i}]    ${text}
            END
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Remove All Devices
    [Documentation]
    ...    Removes all devices

    ${rows}=  Get Element Count    css=table.MuiTable-root tbody > tr

    WHILE    ${rows} > 0
        ${rows}=       Evaluate        ${rows} - 1

        # Click the button in the last column
        ${button}=    Get Element    css=table.MuiTable-root tbody > tr:last-child >> td:last-child >> button
        Click         ${button}
        Click         li:has-text("Remove")
    END

Click Device Option
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${name}
    ...    ${option}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr
    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        IF    '${col_name}' == '${name}'
            # Click the button in the last column
            ${button}=     Get Element    ${columns}[-1] >> css=button
            Click          ${button}
            Click          "${option}"
            ${row_found}=  Set Variable   ${True}
            Exit For Loop
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Edit Device
    [Documentation]
    ...    Edit a given device details
    [Arguments]
    ...    ${name}
    ...    ${newName}=${EMPTY}
    ...    ${group}=${EMPTY}
    ...    ${on_time}=${EMPTY}
    ...    ${off_time}=${EMPTY}
    ...    ${count}=${EMPTY}
    ...    ${consumption}=${EMPTY}
    
    Click Device Option    ${name}    Edit

    IF    "${newName}" != "${EMPTY}"
        Fill Text    //*[@name="deviceName"]    ${newName}
    END

    Click    button:has-text("Update")

Click Device Option by Index
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${index}
    ...    ${option}

    ${row}=     Get Element    css=table.MuiTable-root tbody > tr:nth-child(${index})
    ${button}=  Get Element    ${row} >> css=td:last-child > button
    Click       ${button}
    Click       li:has-text("${option}")