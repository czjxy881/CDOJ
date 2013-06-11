/*
 *
 *  * cdoj, UESTC ACMICPC Online Judge
 *  * Copyright (c) 2013 fish <@link lyhypacm@gmail.com>,
 *  * 	mzry1992 <@link muziriyun@gmail.com>
 *  *
 *  * This program is free software; you can redistribute it and/or
 *  * modify it under the terms of the GNU General Public License
 *  * as published by the Free Software Foundation; either version 2
 *  * of the License, or (at your option) any later version.
 *  *
 *  * This program is distributed in the hope that it will be useful,
 *  * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  * GNU General Public License for more details.
 *  *
 *  * You should have received a copy of the GNU General Public License
 *  * along with this program; if not, write to the Free Software
 *  * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 */

/**
 * All function used in contest page.
 *
 * @author <a href="mailto:muziriyun@gmail.com">mzry1992</a>
 * @version 1
 */

var timeLeft;
var timeLeftDiv;
var totTime;
var timeLeftProgress;

function refreshCurrentTime() {
    timeLeftDiv.empty();
    timeLeftDiv.append(timeLeft);
    timeLeftDiv.formatTimeStyle();
    timeLeftProgress.css('width', (1 - timeLeft / totTime) * 100 + '%');
    timeLeft--;
}

/**
 * current status list
 */
var statusList;

function getStatusId(statusId) {
    var html = $('<td>' + statusId + '</td>');
    return html;
}

function getUserName(userName) {
    var html = $('<td><a href="/user/center/' + userName + '">' + userName + '</a></td>');
    return html;
}

function getProblemId(problemId) {
    var html = $('<td><a href="/problem/show/' + problemId + '">' + problemId + '</td>');
    return html;
}

function getJudgeResponse(returnType, returnTypeId, statusId, userName) {
    var html = $('<td></td>');
    if (returnTypeId == 0)
        html.addClass('status-querying');
    else if (returnTypeId == 1)
        html.addClass('status-accept');
    else
        html.addClass('status-error');
    if (returnTypeId == 7 && (currentUserType == 1 || userName == currentUser))
        html.append($('<a id="compileInfo" href="#" statusId="' + statusId + '">' + returnType + '</a>'));
    else
        html.append(returnType);
    return html;
}

function getCodeUrl(length, statusId, userName) {
    var html = $('<span style="margin-right: 8px;"></span>');
    if (currentUserType == 1 || userName == currentUser)
        html.append($('<a id="codeHref" href="#" statusId="' + statusId + '">' + length + ' B</a>'));
    else
        html.append(length + ' B');
    return html;
}

function getLength(length, language, statusId, userName) {
    var html = $('<td style="text-align: right;"></td>');
    html.append(getCodeUrl(length, statusId, userName));
    html.append($('<span class="label label-success" style="width: 30px; text-align: center;">' + language + '</span>'));
    return html;
}

function getTimeCost(timeCost) {
    var html = $('<td></td>');
    if (timeCost != '')
        html.append($('<span>' + timeCost + ' ms</span>'));
    return html;
}

function getMemoryCost(memoryCost) {
    var html = $('<td></td>');
    if (memoryCost != '')
        html.append($('<span>' + memoryCost + ' KB</span>'));
    return html;
}

function getTime(time) {
    var html = $('<td class="cdoj-time">' + time + '</td>');
    return html;
}

function getHTML(value) {
    var html = $('<tr></tr>');
    html.append(getStatusId(value.statusId));
    html.append(getProblemId(value.problemId));
    html.append(getJudgeResponse(value.returnType, value.returnTypeId, value.statusId, value.userName));
    html.append(getLength(value.length, value.language, value.statusId, value.userName));
    html.append(getTimeCost(value.timeCost));
    html.append(getMemoryCost(value.memoryCost));
    html.append(getTime(value.time));
    return html;
}

function blindCodeHref() {
    $('#codeHref').live('click', function () {
        var id = $(this).attr('statusId');
        $.post('/status/code/' + id, function (data) {
            var codeModal = $('#codeModal');
            var codeLabel = $('#codeModalLabel');
            var codeViewer = $('#codeViewer');
            codeLabel.empty();
            codeLabel.append('Code ' + data.code.codeId);
            codeViewer.empty();

            var str = data.code.content;
            str = '<pre class="prettyprint linenums">' + str + '</pre>'
            codeViewer.append(str);

            var mult = 0.95;
            if (Sys.windows)
                mult = 0.65;

            codeViewer.css('max-height', Math.min(600, $(window).height() * mult));
            prettyPrint();
            codeModal.modal();
        });
        return false;
    });
}


function blindCompileInfo() {
    $('#compileInfo').live('click', function () {
        var id = $(this).attr('statusId');
        $.post('/status/compileInfo/' + id, function (data) {
            var compileInfoModal = $('#compileInfoModal');
            var compileInfoModalLabel = $('#compileInfoModalLabel');
            var compileInfoViewer = $('#compileInfoViewer');
            compileInfoModalLabel.empty();
            compileInfoModalLabel.append('Compilation Error Information');
            compileInfoViewer.empty();
            compileInfoViewer.removeClass('linenums');
            compileInfoViewer.append(data.CEInformation);
            prettyPrint();
            compileInfoModal.modal();
        });
        return false;
    });
}

function refreshStatusList(condition) {
    if (condition == null)
        condition = currentCondition;
    $.post('/contest/status/' + currentContest, condition, function (data) {
        console.log(data);
        if (data.result == "error") {
            alert(data.error_msg);
            return;
        }

        //pagination
        $('#pageInfo').empty();
        $('#pageInfo').append(data.pageInfo);
        $('#pageInfo').find('a').click(function (e) {
            if ($(this).attr('href') == null)
                return false;
            currentCondition.currentPage = $(this).attr('href');
            refreshStatusList(currentCondition);
            return false;
        });

        statusList = data.statusList;
        var tbody = $('#statusList');
        // remove old user list
        tbody.find('tr').remove();
        // put user list

        $.each(statusList, function (index, value) {
            tbody.append(getHTML(value));
        });

        blindCodeHref();
        blindCompileInfo();

        // format time style
        $('.cdoj-time').formatTimeStyle();
    });
}

function changeOrder(field) {
    if (currentCondition["statusCondition.orderFields"] == field)
        currentCondition["statusCondition.orderAsc"] = (currentCondition["statusCondition.orderAsc"] == "true" ? "false" : "true");
    else {
        currentCondition["statusCondition.orderFields"] = field;
        currentCondition["statusCondition.orderAsc"] = "true";
    }
    refreshStatusList(currentCondition);
}

var currentContest;

$(document).ready(function () {
    //Init current time left
    timeLeftDiv = $('#timeLeft');
    if (timeLeftDiv) {
        timeLeftProgress = $('#timeLeftProgress');
        timeLeft = timeLeftDiv.attr('value');
        totTime = parseInt(timeLeftDiv.attr('totTime'));
        setInterval(refreshCurrentTime, 1000);
    }

    //Blind resize function
    $('.problemHref').each(function () {
        var target = $(this).attr('target');
        $(this).click(function () {
            $('#TabMenu').find('a[href="#tab-contest-problem-' + target + '"]').tab('show');
            return false;
        });

        $('#TabMenu').find('a[href="#tab-contest-problem-' + target + '"]').on('shown', function () {
            var problem = $('#tab-contest-problem-' + target);
            // make sample input and output have the same height
            var height = 0;
            $.each(problem.find('.sample'), function () {
                height = Math.max(height, $(this).height());
            });
            $.each(problem.find('.sample'), function () {
                $(this).css('height', height);
            });
        });
    });

    markdown();

    $.each($('.sample'), function () {
        var md = $(this).html()
            .replace('<textarea>', '')
            .replace('</textarea>', '')
            .replace('<TEXTAREA>', '')
            .replace('</TEXTAREA>', '')
            .replace('\r', '<br/>');
        $(this).empty().append(md);
    });

    // make code pretty
    prettify();

    MathJax.Hub.Config({
        tex2jax: {inlineMath: [
            ['$', '$'],
            ['\\[', '\\]']
        ]}
    });
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

    currentCondition = {
        "currentPage": null,
        "statusCondition.startId": undefined,
        "statusCondition.endId": undefined,
        "statusCondition.userName": undefined,
        "statusCondition.problemId": undefined,
        "statusCondition.languageId": undefined,
        "statusCondition.contestId": undefined,
        "statusCondition.result": undefined,
        "statusCondition.orderFields": undefined,
        "statusCondition.orderAsc": undefined
    }

    $.each($('.orderButton'), function () {
        var field = $(this).attr('field');
        $(this).setButton({
            callback: function () {
                changeOrder(field);
            }
        });
    });

    currentContest = $('.currentContestId').attr('value');

    //Only refresh status at status tab
    var timer;
    $('#TabMenu').find('a[href="#tab-contest-status"]').on('show', function(){
        refreshStatusList(currentCondition);
        timer = setInterval(refreshStatusList, 3000);
    });
    $('#TabMenu').find('a[href!="#tab-contest-status"]').on('show', function(){
        if (timer)
            clearInterval(timer);
    });

    //Blind Submit
    $('#submitCode').click(function () {
        info = {
            'codeContent': null,
            'languageId': null,
            'contestId': currentContest,
            'problemId': null
        }
        //Get code content
        info['codeContent'] = $('#codeContent').val();
        //Get language Id
        info['languageId'] = $('#languageSelector').find('.active').attr('value');

        //Get problem Id
        info['problemId'] = $('#problem-selector').find('#problemId').attr('value');

        $.post('/status/submit', info, function (data) {
            if (data.result == 'error')
                alert(data.error_msg);
            else if (data.result == 'ok') {
                $('#TabMenu').find('a[href="#tab-contest-status"]').tab('show');
                //TODO change it like PC^2
            } else {
                alert('Please login first!');
                $("#problemSubmitModal").modal('hide');
                $("#loginModal").modal();
            }
        });
    });

});