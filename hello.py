#!/usr/bin/python3

import tornado.ioloop
import tornado.web
import tornado.template
import os.path
import time
import re
import csv
from datetime import datetime
import json
import datetime as dt
import fasteners


date_value = time.strftime("%d:%m:%G")
time_value = time.strftime("%H")
setting = dict(
    template_path=os.path.join(os.path.dirname(__file__), "templates"),
    static_path=os.path.join(os.path.dirname(__file__), "static"),
    debug=True
)
REs = {}
CAs = []
Mngip = {}
dict_cnflct = {}
list_days = []


def create_date_list():
    global list_days
    days = dt.datetime.today()
    for i in range(7):
        list_days.append(str(days).split()[0])
        days = days + dt.timedelta(1)


def csv_reader():
    """
    reads the csv files and creates a list of CAs
    a dictionary with CA name as keys and management ip as values
    and also another dictionary Ca name as keys and a list of REs as their values
    """
    global REs, CAs
    #   defines two regular expression and apply them on the CA name and RE name column in the file
    ptrn = re.compile(".*CA[0-9]+")
    ptrn_RE = re.compile(".*RE[0-9]+")
    try:
        with open("file.csv") as file_obj:
            reader = csv.reader(file_obj)
            #   make a list of CAs
            for row in reader:
                if ptrn.match(row[0]):
                    CAs.append(row[0])
                    Mngip.update({row[0]: row[16]})

        with open("interfaces.csv") as intf_obj:
            intf_reader = csv.reader(intf_obj)
            for ca in CAs:
                intf_obj.seek(0)
                int_node = []
                for row_r in intf_reader:
                    if ca == row_r[0] and ptrn_RE.match(row_r[1]):
                        int_node.append(row_r[1])
                REs.update({ca: int_node})
    except IOError:
        print("can not open CSV files, Please Contact system admin")


def mk_dict_schl(ca_ip):
    dic_overview = {}
    days = dt.datetime.today()
    file_path = "schedule"
    rw_lock = fasteners.ReaderWriterLock()
    with rw_lock.read_lock():
        with open(file_path, 'r') as f_output:
            for i in range(7):
                dic_overview.update({str(days).split()[0]: ""})
                for line in f_output:
                    list_line = line.split()
                    date_s_obj = datetime.strptime(list_line[3], '%d:%m:%Y')
                    temp_date_s = str(date_s_obj).split()[0]
                    str_date = str(days).split()[0]
                    time_s = int(list_line[4])
                    time_len = int(list_line[6]) - int(list_line[4])
                    if list_line[1] == ca_ip and str_date == temp_date_s:
                        if dic_overview[str_date] == "":
                            dic_overview[str_date] = {}
                            dic_overview[str_date].update({time_s: [list_line[2], time_len]})
                        else:
                            dic_overview[str_date].update({time_s: [list_line[2], time_len]})
                f_output.seek(0)
                days = days + dt.timedelta(1)
    # print(dic_overview)
    # print(dic_overview['2017-08-09'])
    return dic_overview


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        """
            loads the html template passes the list of CAs and date and time to the template
        """
        self.render("template.html", CAs=CAs, date_value=date_value, time_value=time_value, list_days=list_days)


class ViewHandler(tornado.web.RequestHandler):
    def post(self):
        """
            gets a CA name from drop box then find out its management ip address call a function that returns a dictionary of conflict in the txt file
        """
        value = self.get_argument('CA_drp_v')
        # print(Mngip[value])
        dic_over = mk_dict_schl(Mngip[value])
        self.write(dic_over)


class FormHandler(tornado.web.RequestHandler):
    def post(self):
        """
                handle the post request at the frontend which is a dictionary of new scheduling
                checks if the file exist and if there is any conflict returns a dictionary
        :return: a dictionary which is a list of conflict in the existing file
        """
        def write_to_file(lst, obj_file):
            """
            :param lst: list of dictionaries has been posted as new scheduling
            :param obj_file: file object is going to be written
            """
            cuntr = 1
            for item in lst:
                obj_file.write(str(cuntr) + ' ' + Mngip[item['CaNam']] + ' ' + item['ReNam'] + ' ' +
                               item['dt_s'] + ' ' + item['tm_s'] + ' ' + item['dt_e'] + ' ' +
                               item['tm_e'] + '\n')
                cuntr += 1

        def check_conflict(lst_schl):
            """
                checks if the file exists and if there is any conflict returns a dictionary
            :param lst_schl: list of dictionaries that has been posted as new scheduling
            :return: a dictionary which is a list of conflict in the existing file
            """
            global dict_cnflct
            dict_cnflct = {}
            file_path = "schedule"
            bl_cnflct = False
            cnflct_list = []
            if os.path.isfile(file_path):
                # file exist
                rw_lock = fasteners.ReaderWriterLock()
                with rw_lock.read_lock():
                    with open(file_path, 'r') as f_output:
                        y = 0
                        for line in f_output:
                            list_line = line.split()
                            date_s_obj = datetime.strptime(list_line[3], '%d:%m:%Y')
                            time_s = int(list_line[4])
                            date_e_obj = datetime.strptime(list_line[5], '%d:%m:%Y')
                            time_e = int(list_line[6])
                            for item in lst_schl:
                                # checking each row of new schedule with all rows in previous file
                                new_date_s = datetime.strptime(item['dt_s'], '%d:%m:%Y')
                                new_date_e = datetime.strptime(item['dt_e'], '%d:%m:%Y')
                                new_time_s = int(item['tm_s'])
                                new_time_e = int(item['tm_e'])
                                # checking if there is any conflict
                                if list_line[1] == Mngip[item['CaNam']] and\
                                        ((date_s_obj < new_date_s < date_e_obj) or (date_s_obj < new_date_e < date_e_obj)
                                         or (date_s_obj >= new_date_s and date_e_obj <= new_date_e)
                                         or (new_date_s < date_s_obj and new_date_e > date_e_obj))\
                                        and ((time_s < new_time_s < time_e) or (time_s < new_time_e < time_e)
                                             or (new_time_s <= time_s and new_time_e >= time_e)):
                                    bl_cnflct = True
                                    cnflct_list.extend([item['CaNam'], list_line[2], list_line[3],
                                                        list_line[4], list_line[5], list_line[6]])
                                    dict_cnflct.update({y: cnflct_list})
                                    y += 1
                                    cnflct_list = []

                    if not bl_cnflct:
                        # if there is no conflict append to the existing file
                        rw_lock = fasteners.ReaderWriterLock()
                        with rw_lock.read_lock():
                            with open(file_path, 'a') as f_output:
                                write_to_file(lst_schl, f_output)
                            return {0: "empty"}

                    elif bl_cnflct:
                        # return a dictionary of conflicts
                        return dict_cnflct

            else:
                # if the file doesn't exist
                rw_lock = fasteners.ReaderWriterLock()
                with rw_lock.read_lock():
                    with open(file_path, 'w') as f_output:
                        write_to_file(lst_schl, f_output)
                    return {0: "empty"}

        try:
            i = 1
            mylist = self.get_argument('table[%d][col1]' % i)
            dict_schl = {}
            lstA = []
            while mylist != "":
                CaNam = str(self.get_argument('table[%d][col1]' % i))
                ReNam = str(self.get_argument('table[%d][col2]' % i))
                dt_s = str(self.get_argument('table[%d][col3]' % i))
                dt_e = str(self.get_argument('table[%d][col4]' % i))
                dt_t = str(self.get_argument('table[%d][col5]' % i))
                tm_s = str(self.get_argument('table[%d][col6]' % i))
                tm_e = str(self.get_argument('table[%d][col7]' % i))
                dict_schl.update({'CaNam': CaNam, 'ReNam': ReNam, 'dt_s': dt_s, 'dt_e': dt_e, 'dt_t': dt_t,
                                  'tm_s': tm_s, 'tm_e': tm_e})
                lstA.append(dict_schl)
                dict_schl = {}
                i += 1
                mylist = self.get_argument('table[%d][col1]' % i)
        except:
            pass
        list_of_conflict = check_conflict(lstA)
        dict_cnflct = {}
        self.write(list_of_conflict)


class DrbHandler(tornado.web.RequestHandler):
    def post(self):
        """
            gets a value from CAs drop box and returns a dictionary of REs
        """
        value = self.get_argument('CA_drpBx')
        list_re = REs[str(value)]
        dict_re = {}
        i = 0
        # convert the list into a dictionary
        for re in list_re:
            dict_re.update({i: re})
            i += 1
        self.write(dict_re)


def make_app():
    return tornado.web.Application([(r"/", MainHandler),
                                    (r"/form", FormHandler), (r"/api/Ca", DrbHandler),
                                    (r"/api/view", ViewHandler)], **setting)

if __name__ == "__main__":
    csv_reader()
    create_date_list()
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()
